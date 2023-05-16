import eswi from './extract-swi-from-json.js'

async function main() {
  await eswi(
    'D:/Workdir/sh23/sh23-dmv-server/docs/Replace Front Brake Pads.json',
    true
  )
  console.log('done')
}

main()
