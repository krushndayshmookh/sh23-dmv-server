// vercel serverless function to fetch data for SWI with id [id]
// [id] is the id of the SWI to fetch
// returns the SWI data as JSON
import { sql } from '@vercel/postgres'

const getSWI = async (id) => {
  if (id) {
    const { rows: swiList } = await sql`select * from swi_json where id = ${id}`
    let swi = swiList[0]

    if (!swi) {
      return { message: 'No SWI found with that ID.' }
    }

    swi = { id: swi.id, ...swi.json }

    return swi
  } else {
    return res.status(400).json({ message: 'No SWI ID provided.' })
  }
}

export default async (req, res) => {
  const {
    query: { id },
  } = req

  const swi = await getSWI(id)

  res.statusCode = 200
  res.json(swi)
}
