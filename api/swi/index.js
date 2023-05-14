// vercel serverless function to search for SWI
// returns the SWI data as JSON

const searchSWI = async (search) => {
  // fetch SWI data from database

  return []
}

export default async (req, res) => {
  const {
    query: { search },
  } = req

  const swiList = await searchSWI(search)

  res.statusCode = 200
  res.json(swiList)
}