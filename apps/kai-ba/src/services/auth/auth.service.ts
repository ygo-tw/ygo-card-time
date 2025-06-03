import { DataAccessService } from '@ygo/mongo-server';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import {
  AdminDataType,
  DataAccessEnum,
  PermissionDataType,
  RefreshTokenDataType,
} from '@ygo/schemas';
import {
  UserNotFoundError,
  PasswordNotValidError,
  AuthError,
  AUTH_ERROR_MESSAGES,
} from '../error/business';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JWTPayload, UserInfo } from '../../Interface/auth.type';
import { DataCacheService } from '@ygo/cache';

export class AuthService {
  constructor(
    private readonly dal: DataAccessService,
    private readonly cache: DataCacheService,
    private readonly logger: FastifyBaseLogger
  ) {}

  /**
   * 登入
   * @param account 帳號
   * @param password 密碼
   * @returns 是否登入成功
   */
  public async login(
    reply: FastifyReply,
    { account, password }: { account: string; password: string }
  ): Promise<UserInfo> {
    const user = (
      await this.dal.find<AdminDataType>(DataAccessEnum.ADMIN, { account })
    )[0];

    if (!user) {
      throw new UserNotFoundError(`${account} 尚未設定帳號`);
    }

    const permission = (
      await this.dal.find<PermissionDataType>(DataAccessEnum.PERMISSION, {
        type: user?.type,
      })
    )[0];

    if (!permission) {
      throw new UserNotFoundError(`${account} 尚未設定權限`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new PasswordNotValidError(account);
    }

    this.logger.info(
      'authService/login: user logged in successfully: %s',
      user.account
    );

    const userInfo: UserInfo = {
      id: user._id.toString(),
      email: user.email,
      account: user.account,
      role: permission.permission,
      provider: 'local',
    };

    const accessToken = await reply.jwtSign(userInfo, { expiresIn: '30m' });

    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天

    await this.dal.createOne<RefreshTokenDataType>(
      DataAccessEnum.REFRESH_TOKEN,
      {
        userId: userInfo.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry.toISOString(),
        isRevoked: false,
        createdAt: new Date().toISOString(),
      }
    );

    reply.setCookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 60 * 1000, // 30分鐘
    });

    reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    return userInfo;
  }

  /**
   * 刷新 Access Token
   * @param reply 回應
   * @param refreshToken 刷新 token
   * @returns 使用者資訊
   */
  public async refreshAccessToken(
    reply: FastifyReply,
    refreshToken: string
  ): Promise<UserInfo> {
    const storedToken = await this.dal.findOne<RefreshTokenDataType>(
      DataAccessEnum.REFRESH_TOKEN,
      {
        token: refreshToken,
        isRevoked: false,
      }
    );

    if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
      throw new AuthError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    // 取得使用者資訊
    const user = await this.dal.findOne<AdminDataType>(DataAccessEnum.ADMIN, {
      _id: storedToken.userId,
    });

    if (!user) {
      throw new UserNotFoundError('使用者不存在');
    }

    const permission = await this.dal.findOne<PermissionDataType>(
      DataAccessEnum.PERMISSION,
      { type: user.type }
    );

    const userInfo: UserInfo = {
      id: user._id.toString(),
      email: user.email,
      account: user.account,
      role: permission?.permission || [],
      provider: 'local',
    };

    // 產生新的 Access Token
    const newAccessToken = await reply.jwtSign(userInfo, { expiresIn: '30m' });

    // 設定新的 Cookie
    reply.setCookie('accessToken', newAccessToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 60 * 1000,
    });

    this.logger.info(
      'authService/refresh: token refreshed for user: %s',
      user.account
    );

    return userInfo;
  }

  /**
   * 登出
   * @param request 請求
   * @param reply 回應
   */
  public async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // 1. 正確取得 refresh token（解簽名）
    const signedRefreshToken = request.cookies.refreshToken;
    let refreshToken: string | undefined;

    if (signedRefreshToken) {
      const unsigned = request.unsignCookie(signedRefreshToken);
      refreshToken = unsigned.valid ? unsigned.value : undefined;
    }

    // 1. 撤銷 refresh token（如果存在）
    if (refreshToken) {
      const updatedCount = await this.dal.findAndUpdate<RefreshTokenDataType>(
        DataAccessEnum.REFRESH_TOKEN,
        { token: refreshToken, isRevoked: false },
        { $set: { isRevoked: true } }
      );

      if (!updatedCount) {
        this.logger.warn('logout: refresh token not found or already revoked');
      }
    }

    // 2. 將 access token 加入 Redis 黑名單（如果存在且未過期）
    const accessToken = request.cookies.accessToken;
    if (accessToken) {
      try {
        // 解析 JWT 取得過期時間
        const decoded = await request.jwtVerify<JWTPayload>();
        if (decoded && decoded.exp) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;

          // 只有未過期的 token 才需要加入黑名單
          if (ttl > 0) {
            await this.cache.set({
              keys: ['JWT', 'BLACKLIST', accessToken],
              value: '1',
              useMemory: true,
              useRedis: true,
              memoryTTLSeconds: ttl,
              redisTTLSeconds: ttl,
            });
          }
        }
      } catch (error) {
        this.logger.warn('logout: failed to blacklist access token', error);
      }
    }

    // 3. 清除 Cookie
    reply.clearCookie('accessToken');
    reply.clearCookie('refreshToken');

    // 4. 記錄日誌
    this.logger.info('authService/logout: user logged out successfully');
  }

  /**
   * 強制登出指定用戶的所有會話
   * @param userId 要強制登出的用戶 ID
   * @param currentRequest 當前請求（可選，如果是強制登出自己則提供）
   * @param currentReply 當前回應（可選，如果是強制登出自己則提供）
   */
  public async forceLogout(
    userId: string,
    currentRequest?: FastifyRequest,
    currentReply?: FastifyReply
  ): Promise<void> {
    try {
      // 1. 撤銷該用戶所有的 refresh token
      const revokedCount = await this.dal.updateMany(
        DataAccessEnum.REFRESH_TOKEN,
        { userId, isRevoked: false },
        { $set: { isRevoked: true } }
      );

      this.logger.info(
        `forceLogout: revoked ${revokedCount} refresh tokens for user: ${userId}`
      );

      // 2. 查找該用戶所有未撤銷的 refresh token 來取得相關的 access token
      // 但由於我們無法直接取得所有 access token，這部分需要其他策略

      // 3. 如果是當前用戶且提供了 request/reply，則處理當前的 access token 和 cookie
      if (currentRequest && currentReply) {
        // 將當前的 access token 加入黑名單
        const accessToken = currentRequest.cookies.accessToken;
        if (accessToken) {
          try {
            const decoded = await currentRequest.jwtVerify<JWTPayload>();
            if (decoded && decoded.exp) {
              const now = Math.floor(Date.now() / 1000);
              const ttl = decoded.exp - now;

              if (ttl > 0) {
                await this.cache.set({
                  keys: ['JWT', 'BLACKLIST', accessToken],
                  value: '1',
                  useMemory: true,
                  useRedis: true,
                  memoryTTLSeconds: ttl,
                  redisTTLSeconds: ttl,
                });
              }
            }
          } catch (error) {
            this.logger.warn(
              'forceLogout: failed to blacklist current access token',
              error
            );
          }
        }

        // 清除當前的 cookie
        currentReply.clearCookie('accessToken');
        currentReply.clearCookie('refreshToken');
      }

      this.logger.info(
        `forceLogout: successfully forced logout for user: ${userId}`
      );
    } catch (error) {
      this.logger.error(
        `forceLogout: failed to force logout user ${userId}:`,
        error
      );
      throw new Error(`強制登出失敗: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 產生 refresh token
   */
  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
}
