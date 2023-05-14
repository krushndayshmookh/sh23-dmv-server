// vercel serverless function to fetch data for SWI with id [id]
// [id] is the id of the SWI to fetch
// returns the SWI data as JSON

const getSWI = async (id) => {
  // fetch SWI data from database

  return {}
}

export default async (req, res) => {
  const {
    query: { id },
  } = req

  const swi = await getSWI(id)

  res.statusCode = 200
  res.json(swi)
}
