import { Request, Response } from 'express'
import { getXmlData } from './shared/shared'
import { XMLParser } from 'fast-xml-parser'

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
      district: e['eml:ContestIdentifier']['eml:ContestName'],
      enrolment: e.Enrolment, // not total votes!!
      candidates: e.FirstPreferences.Candidate.map((f) => ({
        name: f['eml:CandidateIdentifier']['eml:CandidateName'],
        party:
          f['eml:AffiliationIdentifier']?.['eml:RegisteredName'] || undefined,
        votes: f.Votes,
      })),
      twoParty: e.TwoCandidatePreferred.Candidate.map((g) => ({
        name: g['eml:CandidateIdentifier']['eml:CandidateName'],
        party:
          g['eml:AffiliationIdentifier']?.['eml:RegisteredName'] || undefined,

        votes: g.Votes,
      })),
    }))

    // send the data back
    res.type('application/json').status(200).send(cleanData)
  } catch (error) {
    console.log('ERROR::' + error)

    res.status(500).json(error)
  }
}
