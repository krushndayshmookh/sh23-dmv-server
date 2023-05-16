// vercel serverless function to search for SWI
// returns the SWI data as JSON

import { sql } from '@vercel/postgres'

const searchSWI = async (search) => {
  if (search) {
    const { rows: swiList } =
      await sql`select id, name, description from swi_json where name ilike ${
        '%' + search + '%'
      } or description ilike ${'%' + search + '%'}`

    return swiList
  } else {
    const { rows: swiList } =
      await sql`select id, name, description from swi_json`
    return swiList
  }
}

export default async (req, res) => {
  const {
    query: { search },
  } = req

  const swiList = await searchSWI(search)

  res.statusCode = 200
  res.json(swiList)
}
