// vercel serverless function to create a new SWI
// returns the SWI data as JSON

import { sql } from '@vercel/postgres'

const createSWI = async (swi) => {
  const { rows: swiList } =
    await sql`insert into swi (name, description) values (${swi.name}, ${swi.description}) returning *`

  return swiList[0]
}

const createStep = async (step) => {
  const { rows: stepList } =
    await sql`insert into step (name, description, swi_id) values (${step.name}, ${step.description}, ${step.swi_id}) returning *`

  return stepList[0]
}

export default async (req, res) => {
  const { body: swi } = req

  const newSWI = await createSWI(swi)

  const newStepList = await Promise.all(
    swi.steps.map((step) => {
      return createStep({ ...step, swi_id: newSWI.id })
    })
  )

  res.statusCode = 200
  res.json({ ...newSWI, steps: newStepList })
}
