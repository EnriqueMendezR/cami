import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request) {
  const formData = await request.formData()

  const footageFile = formData.get('footage')
  const generatedFile = formData.get('generated')

  if (!(footageFile instanceof File) || !(generatedFile instanceof File)) {
    return Response.json(
      { error: 'Both "footage" and "generated" video files are required.' },
      { status: 400 }
    )
  }

  const tmpDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tmpDir, { recursive: true })

  const timestamp = Date.now()

  const footageExt = path.extname(footageFile.name) || '.mp4'
  const generatedExt = path.extname(generatedFile.name) || '.mp4'

  const footageName = `footage_${timestamp}${footageExt}`
  const generatedName = `generated_${timestamp}${generatedExt}`

  const footagePath = path.join(tmpDir, footageName)
  const generatedPath = path.join(tmpDir, generatedName)

  const [footageBuffer, generatedBuffer] = await Promise.all([
    footageFile.arrayBuffer(),
    generatedFile.arrayBuffer(),
  ])

  fs.writeFileSync(footagePath, Buffer.from(footageBuffer))
  fs.writeFileSync(generatedPath, Buffer.from(generatedBuffer))

  return Response.json({
    footagePath,
    generatedPath,
  })
}
