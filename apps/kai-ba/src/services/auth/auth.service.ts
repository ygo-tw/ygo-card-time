import { DataAccessService } from '@ygo/mongo-server';
import { FastifyBaseLogger, FastifyReply } from 'fastify';
import {
  AdminDataType,
  DataAccessEnum,
  PermissionDataType,
} from '@ygo/schemas';
import {
  UserNotFoundError,
  PasswordNotValidError,
} from '../errorService/businessError/authError';
import bcrypt from 'bcrypt';
import { UserInfo } from '../../Interface/auth.type';
export class AuthService {
  constructor(
    private readonly dal: DataAccessService,
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

    const token = await reply.jwtSign(userInfo);

    reply.setCookie('sid', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 開發環境設為 false
      sameSite: 'lax',
      signed: true,
    });

    return userInfo;
  }
}
