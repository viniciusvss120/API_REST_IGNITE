/* eslint-disable prettier/prettier */
import type { Knex } from "knex";

// Aqui estamos criando a tabela com o nome de tansactions
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    // Aqui estamos criando as colunas, table referencia a tabela que estamos criando depois estamos passando método que é o tipo de dados que a coluna vai receber e, nesses métodos, passamos o nome da coluna. Logo em seguida passamos algumas definições como, a primary key e que o campo não pode ser null.
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}

