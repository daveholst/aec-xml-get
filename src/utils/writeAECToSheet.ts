import { XMLParser } from 'fast-xml-parser'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { getXmlData } from './getXmlData'

import { logger } from './logger'
import { waElectorates } from './waElectorates'

export async function writeAecDataToSheet() {
  try {
    logger.info('Starting AEC Retrieval')
    // init parser
    const parser = new XMLParser()
    // get the xml off the ftp
    const xmlData = await getXmlData()
    // convert over to JSON
    logger.info('Converting XML to JSON')

    let parsedData = await parser.parse(xmlData)

    const contentArray =
      parsedData.MediaFeed.Results.Election[0].House.Contests.Contest

    logger.info('Cleaning JSON')

    let cleanData = contentArray.map((e) => ({
      electorate: e['eml:ContestIdentifier']['eml:ContestName'],
      enrolment: e.Enrolment, // not total votes!!
      candidates: e.FirstPreferences.Candidate.map((f) => ({
        name: f['eml:CandidateIdentifier']['eml:CandidateName'],
        party:
          f['eml:AffiliationIdentifier']?.['eml:RegisteredName'] || undefined,
        votes: f.Votes,
        twoCandidateVotes: e.TwoCandidatePreferred.Candidate.find((h) => {
          return (
            h['eml:CandidateIdentifier']['eml:CandidateName'] ===
            f['eml:CandidateIdentifier']['eml:CandidateName']
          )
        })?.Votes,
      })),
      twoCandidate: e.TwoCandidatePreferred.Candidate.map((g) => ({
        name: g['eml:CandidateIdentifier']['eml:CandidateName'],
        party:
          g['eml:AffiliationIdentifier']?.['eml:RegisteredName'] || undefined,

        votes: g.Votes,
      })),
    }))
    // wa only data -- probably not very efficient
    const waCleanData = cleanData.filter((e) =>
      waElectorates.includes(e.electorate)
    )

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(
      '1s9aWUMv7qzPZD7nMq71xPmmkBDBiwb0bdWlj2VIu0N0'
    )
    // Authenticate
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: atob(process.env.GOOGLE_KEY).replace(/\\n/g, '\n'),
    })

    // This errors once made. Prob need to do a check or an init script :shrug:
    await doc.loadInfo()

    // logger.info('Sheets List', doc.sheetsByTitle)

    // updater function
    // await waCleanData.forEach(async (elec) => {
    //   const sheet = doc.sheetsByTitle[elec]
    //   const rows =
    //   sheet.
    // })

    // Sheet Exists so I'm commenting this out
    logger.info('Staring Write to Google Sheet')
    await waCleanData.map(async (elec) => {
      // delete the old sheet if it exists
      if (doc.sheetsByTitle[elec.electorate]) {
        await doc.deleteSheet(doc.sheetsByTitle[elec.electorate].sheetId)
      }
      // write it back in
      const sheet = await doc.addSheet({
        title: elec.electorate,
        headerValues: ['name', 'party', 'votes', 'twoCandidateVotes'],
      })

      // populate the sheet with candidates
      await sheet.addRows(elec.candidates)
    })
    logger.info('Write Complete')
  } catch (error) {
    logger.error(error)
  }
}
