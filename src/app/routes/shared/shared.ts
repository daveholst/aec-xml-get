import * as ftp from 'basic-ftp'
import StreamZip from 'node-stream-zip'
import fs from 'fs/promises'
import path from 'path'

export async function getXmlData() {
  const client = new ftp.Client()

  const host = 'mediafeedarchive.aec.gov.au'
  const electionCode = '24310'
  const zipDir = `/${electionCode}/Standard/Verbose/`
  const fileNamePrefix = 'aec-mediafeed-Standard-Verbose'

  // client.ftp.verbose = true
  try {
    await client.access({
      host,
    })
    const listedData = await client.list(zipDir)

    // build an array list of timestamps available
    const timestamps = listedData.map((e) =>
      parseInt(e.name.split('-').pop().slice(0, -3))
    )
    // find largest/latest number/timestamp
    const newestTimestamp = Math.max(...timestamps)

    // download the newest files
    console.log(
      `${zipDir}${fileNamePrefix}-${electionCode}-${newestTimestamp}.zip`
    )
    // download zip file
    await client.downloadTo(
      'src/results/results.zip',
      `${zipDir}${fileNamePrefix}-${electionCode}-${newestTimestamp}.zip`
    )
    // close the ftp connection
    client.close()
    // extract the xml file
    const zip = new StreamZip.async({ file: 'src/results/results.zip' })
    await zip.extract(
      `xml/aec-mediafeed-results-standard-verbose-${electionCode}.xml`,
      './src/results/results.xml'
    )
    // close the zip connection
    await zip.close()

    // grab the xml file
    const xmlLocation = path.join(__dirname, '../src/results/results.xml')
    const xml = await fs.readFile(xmlLocation, 'utf8')
    return xml
  } catch (err) {
    console.log(err)
  }
}
