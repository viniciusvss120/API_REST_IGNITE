/* eslint-disable prettier/prettier */
import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../database"
import { randomUUID } from "crypto"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

// Tipos de testes
// unitário: inidade da aplicação
// integração: comunicação entre duas ou mais unidades
// e2e - ponta a ponta: simula um usuário operando nossa aplicação 

export async function transactionsRoutes(app: FastifyInstance) {
  // app.addHook('preHandler', async (req, reply) => {
  //   console.log(`[${req.method}]`)
  // })
  // Quando colocamos '/' em todas as requisições, significa que definimos com padrão o '/transactions' la no aquivo serve, app.register(transactions, {prefix: 'transactions'})

  // O preHandler é uma propriedade para execultar um middleware para cada rota.
  app.get('/',{preHandler: [checkSessionIdExists]}, async (req) => {
      const {sessionId} = req.cookies
    // Aqui fazemos a filtragem das transações usando os cookies salvos.
    const transactions = await knex('transactions').where('session_id', sessionId).select()
    return { transactions }
  })

  app.get('/:id', {preHandler: [checkSessionIdExists]}, async (req) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = getTransactionsParamsSchema.parse(req.params)
    const {sessionId} = req.cookies
    const transactions = await knex('transactions').where({
      session_id: sessionId,
      id
    }).first()

    return { transactions }
  })

  app.get('/sumary', {preHandler: [checkSessionIdExists]}, async (req) => {
    const {sessionId} = req.cookies
    const sumary = await knex('transactions').sum('amount', { as: 'amount' }).where('session_id', sessionId).first()

    return { sumary }
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    // Aqui estamos validado os dado vindos da requisição, comparando com as propriedade z.object
    const { title, amount, type } = createTransactionBodySchema.parse(req.body)
    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })
    }
    await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId
      })
    return reply.status(201).send()

  })
}