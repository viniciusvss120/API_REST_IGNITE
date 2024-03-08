/* eslint-disable prettier/prettier */
import { config } from 'dotenv'
import { z } from 'zod'

// Aqui se o NODE_ENV for igual a teste, lembrando que quendo usamos uma ferramenta de testes, o NODE_ENV é preenchido com nome de test, execultamos nosso config passando o nome para o arquivo de .env.test
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test'})
} else {
  config()
}
// Aqui o zod valida se o dado passado na DATABASE_URL, dentro do .env, é uma string.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333)
})

// Aqui utilizamos o safeParse para verificar as variaveis de ambiente e não jogar logo de cara um erro
const _env = envSchema.safeParse(process.env)

if(_env.success === false) {
  console.error('Deu ruim! Invalid enviroment variable!', _env.error.format())

  throw new Error('Invalid enviroment variable.')
}

export const env = _env.data