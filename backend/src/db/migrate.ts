import 'dotenv/config'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { ssl: 'require', max: 1 })
const db = drizzle(client)

await migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations applied successfully')
await client.end()
