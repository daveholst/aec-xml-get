import { Request, Response } from 'express'
import { getXmlData, waElectorates } from './shared/shared'
import { XMLParser } from 'fast-xml-parser'

import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function cleanDataHandler(req: Request, res: Response) {
  try {
    const parser = new XMLParser()

    // get the xml off the ftp
    const xmlData = await getXmlData()
    // convert over to
    let parsedData = await parser.parse(xmlData)
    // test sanitizer
    const target = 'Brand'

    const contentArray =
      parsedData.MediaFeed.Results.Election[0].House.Contests.Contest
    // console.log(contentArray)
    // contentArray.map((e) => {
    //   console.log(e)
    // })
    // console.log(contentArray.map)

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

    // TODO move this out -- just a test location

    // const testData = waCleanData[0]
    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(
      '1s9aWUMv7qzPZD7nMq71xPmmkBDBiwb0bdWlj2VIu0N0'
    )
    // Authenticate
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })

    // This errors once made. Prob need to do a check or an init script :shrug:
    await waCleanData.forEach(async (elec) => {
      const sheet = await doc.addSheet({
        title: elec.electorate,
        headerValues: ['name', 'party', 'votes', 'twoCandidateVotes'],
      })
      // populate the sheet with candidates
      await sheet.addRows(elec.candidates)
    })

    // send the data back
    res.type('application/json').status(200).send(waCleanData)
  } catch (error) {
    console.log('ERROR::' + error)

    res.status(500).json(error)
  }
}
