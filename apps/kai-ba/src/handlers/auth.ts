import { FastifyRequest, FastifyReply } from 'fastify';

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers['authorization'];

  // 檢查 token 是否為 "secret"
  if (!token || token !== 'secret') {
    reply.status(401).send({ error: 'Unauthorized' });
    throw new Error('Unauthorized');
  }
}
