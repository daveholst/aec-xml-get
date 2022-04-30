import { Request, Response } from 'express'
import { getXmlData } from './shared/shared'
import { XMLParser } from 'fast-xml-parser'

export async function latestJsonHandler(req: Request, res: Response) {
  try {
    // get the xml off the ftp
    const xmlData = await getXmlData()
    // convert over to
    const parser = new XMLParser()
    let jsonData = parser.parse(xmlData)
    // send the data back
    res.type('application/json').status(200).send(jsonData)
  } catch (error) {
    res.status(500).send(error)
  }
}
