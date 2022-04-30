import { Request, Response } from 'express'
import { getXmlData } from './shared/shared'

export async function latestHandler(req: Request, res: Response) {
  try {
    const data = await getXmlData()
    res.type('application/xml').status(200).send(data)
  } catch (error) {
    res.send(error)
  }
}
