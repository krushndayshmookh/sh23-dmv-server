// Path: scripts\extract-swi-from-json.js

import fs from 'fs-extra'
import { createClient } from '@vercel/postgres'

const makeTree = (swiItems) => {
  let tree = []
  let mappedArr = {}
  let mappedElem

  // First map the nodes of the array to an object -> create a hash table.
  swiItems.map((arrElem) => {
    mappedArr[arrElem.uid] = { ...arrElem }
    mappedArr[arrElem.uid]['children'] = []
  })

  for (let uid in mappedArr) {
    if (mappedArr.hasOwnProperty(uid)) {
      mappedElem = mappedArr[uid]
      // If the element is not at the root level, add it to its parent array of children.
      if (mappedElem.parentUid && mappedArr[mappedElem['parentUid']]) {
        mappedArr[mappedElem['parentUid']]['children'].push(mappedElem)
      }
      // If the element is at the root level, add it to first level elements array.
      else {
        tree.push(mappedElem)
      }
    }
  }
  return tree
}

const createSWIData = (json) => {
  const { ServiceData, output } = json

  let allPartIds = [] //*

  let allToolIds = [] //*

  let allSkillIds = []

  let faultCodes = [] //

  let frequency =
    ServiceData.modelObjects[output[0].relatedObjects.Frequency[0].uid].props
      .ssp0FrequencyExpression.dbValues[0]

  let partApplicability = [] //

  let requiredBy = [] //

  let requires = output[0].relatedObjects.Requires.map(
    (requirement) =>
      ServiceData.modelObjects[requirement.uid].props.object_name.dbValues[0]
  )

  let satisfiedBy = [] //

  let satisfies = [] //

  let swiItems = []

  let safetyItems = []

  output[0].swiItems.forEach((item) => {
    let uid = item.uid

    let modelObject = ServiceData.modelObjects[uid]

    let objectTypeId = modelObject.props.swi1UnderlyingObject.dbValues[0]

    let objectType = ServiceData.modelObjects[objectTypeId].type

    let objectValueText = modelObject.props.swi1ObjectName.dbValues[0]

    let parentUid = modelObject.props.swi1Parent.dbValues[0]

    if (objectType == 'SSP0WorkCardRevision' || objectType == 'MEActivity') {
      let parts = modelObject.props.swi1Parts.dbValues
      if (parts?.length) allPartIds = allPartIds.concat(parts)

      let tools = modelObject.props.swi1Tools.dbValues
      if (tools?.length) allToolIds = allToolIds.concat(tools)

      let skills = modelObject.props.swi1Skills.dbValues
      if (skills?.length) allSkillIds = allSkillIds.concat(skills)

      let swiItem = {
        uid,
        type: objectType,
        value: objectValueText,
        parentUid,
      }

      swiItems.push(swiItem)
    }

    if (objectType == 'Smr0Warning') {
      let safetyItem = {
        // uid,
        // type: objectType,
        value: objectValueText,
        // parentUid,
        description: modelObject.props.swi1ObjectDescription.dbValues[0],
      }

      safetyItems.push(safetyItem)
    }
  })

  let skills = [
    ...new Set(
      allSkillIds.map(
        (skillId) =>
          ServiceData.modelObjects[skillId].props.bl_rev_object_name.dbValues[0]
      )
    ),
  ]

  let tools = [
    ...new Set(
      allToolIds.map(
        (toolId) =>
          ServiceData.modelObjects[toolId].props.bl_line_name.dbValues[0]
      )
    ),
  ]

  let parts = [
    ...new Set(
      allPartIds.map(
        (partId) =>
          ServiceData.modelObjects[partId].props.bl_line_name.dbValues[0]
      )
    ),
  ]

  let tree = makeTree(swiItems)

  const SRKeyIds = Object.keys(ServiceData.modelObjects).filter((key) => {
    return ServiceData.modelObjects[key].className === 'SSP0ServiceReq'
  })

  const tc_id = SRKeyIds[0]
  const SR = ServiceData.modelObjects[tc_id]
  const name = SR.props.object_string.dbValues[0]

  return {
    tc_id,
    name,
    description: '',
    frequency,
    parts,
    tools,
    skills,
    faultCodes,
    partApplicability,
    requiredBy,
    requires,
    satisfiedBy,
    satisfies,
    swiItems,
    safetyItems,
    tree,
  }
}

const extractSWIFromJSON = async (jsonPath, writeToDB = false) => {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

  const swiData = createSWIData(json)

  const genPath = './generated/swi-test.json'

  fs.ensureFileSync(genPath)

  fs.writeFileSync(genPath, JSON.stringify(swiData, null, 2), 'utf8')

  if (writeToDB) {
    const client = await createClient({
      connectionString:
        process.env.POSTGRES,
    })
    await client.connect()
    console.log('connected to db')
    await client.sql`insert into swi_json (name, description, json, tc_id) values (${swiData.name}, ${swiData.description}, ${swiData}, ${swiData.tc_id})`
    console.log('done to db')

    const { rows } = await client.sql`select * from swi_json`

    console.log('rows', rows)

    rows.forEach((row) => {
      console.log(row, JSON.stringify(row.json, null, 2))
    })

    await client.end()
  }
}

export default extractSWIFromJSON
