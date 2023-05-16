import { sql } from '@vercel/postgres'

let sampleData = [
  {
    name: 'SWI 1',
    description: 'This is the first SWI',
    steps: [
      {
        name: 'Step 1',
        description: 'This is the first step',
      },
      {
        name: 'Step 2',
        description: 'This is the second step',
      },
    ],
  },
  {
    name: 'SWI 2',
    description: 'This is the second SWI',
    steps: [
      {
        name: 'Step 1',
        description: 'This is the first step',
      },
      {
        name: 'Step 2',
        description: 'This is the second step',
      },
    ],
  },
]

const createDatabase = async () => {
  await sql`create table if not exists swi (
    id serial primary key,
    name text not null,
    description text not null
  )`

  await sql`create table if not exists step (
    id serial primary key,
    name text not null,
    description text not null,
    swi_id integer references swi(id)
  )`

  await sql`create table if not exists swi_json (
    id serial primary key,
    name text ,
    description text ,
    json jsonb,
    tc_id text
  )`
}

const clearDatabase = async () => {
  await sql`delete from step`
  await sql`delete from swi`
}

export default async (req, res) => {
  await createDatabase()
  await clearDatabase()

  for (let i = 0; i < sampleData.length; i++) {
    const swi = sampleData[i]
    const { name, description, steps } = swi

    const { rows } =
      await sql`insert into swi (name, description) values (${name}, ${description}) returning id`
    const swiId = rows[0].id

    for (let j = 0; j < steps.length; j++) {
      const step = steps[j]
      const { name, description } = step

      await sql`insert into step (name, description, swi_id) values (${name}, ${description}, ${swiId})`
    }
  }

  res.statusCode = 200
  res.json({ message: 'success' })
}
