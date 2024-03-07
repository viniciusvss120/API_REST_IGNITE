/* eslint-disable prettier/prettier */
import { FastifyReply, FastifyRequest } from 'fastify'
export async function checkSessionIdExists(req: FastifyRequest, reply: FastifyReply) {
  // Aqui estamos buscando os cookies, enviados quando criamos uma transação, se caso não tiver cookies a aplicação retorna um erro.
  const sessionId = req.cookies.sessionId
  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized'
    })
  }
}