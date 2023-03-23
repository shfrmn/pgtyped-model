import {Pool} from "pg"

export const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "pgtyped-model",
})
