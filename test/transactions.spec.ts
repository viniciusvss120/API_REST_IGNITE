/* eslint-disable prettier/prettier */
import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
// Esse child_process fornece métodos onde podemos execultar scripts em paralélo
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('transactions routes', () => {

  // Aqui executamos essa função para a aplicação terminar de registrar os plugins e ficar pronta para receber requisições
  beforeAll(async () => {
    await app.ready()
  })

  // Aqui descartamos a aplicação
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    // Aqui, para cada teste, apagamos o banco e logo em seguida criamos novamente
    execSync('npm run knex migrate:rollback --all')
    // Esse método permite escrever comando de terminal dentro do nosso código
    execSync('npm run knex migrate:latest')
  })
  // Usar o test ou it não faz diferença, são mais questões semânticas.
  it('o usuário consegue criar uma nova transação', async () => {
    // fazer a chamda http p/ criar uma nova trasação

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })
      .expect(201)
  })

  it('Listar todas as transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    // Listando as transactions utilizando o set, onde setamos o Cookie e passamos nosso cookie para validar, e esperamos um status 200.
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    // Aqui esperamos que na lista de transactions, dentro do body, seja igual a um array de objetos contendo um title e um amount.
    expect(listTransactionsResponse.body.transactions).toEqual([
      // Aqui quer dizer que espereamos um objeto contendo as seguintes propriedades
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    ])
  })
  it('Encontrar uma transactions especifica', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    // Listando as transactions utilizando o set, onde setamos o Cookie e passamos nosso cookie para validar, e esperamos um status 200.
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionsId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionsId}`)
      .set('Cookie', cookies)
      .expect(200)

    // Aqui esperamos que na lista de transactions, dentro do body, seja igual a um array de objetos contendo um title e um amount.
    expect(getTransactionsResponse.body.transactions).toEqual(
      // Aqui quer dizer que espereamos um objeto contendo as seguintes propriedades
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    )
  })

  it('Listar o resumo das transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit'
      })
    // Listando as transactions utilizando o set, onde setamos o Cookie e passamos nosso cookie para validar, e esperamos um status 200.
    const sumaryResponse = await request(app.server)
      .get('/transactions/sumary')
      .set('Cookie', cookies)
      .expect(200)

    // Aqui esperamos que na lista de transactions, dentro do body, seja igual a um array de objetos contendo um title e um amount.
    expect(sumaryResponse.body.sumary).toEqual({
      amount: 3000
    })
  })
})