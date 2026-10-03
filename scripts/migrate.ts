import 'dotenv/config'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { database, closeDatabase } from '../server/db/client'
try {
  await migrate(database(), { migrationsFolder: './drizzle' })
  console.log('Migrations applied.')
} finally {
  await closeDatabase()
}
