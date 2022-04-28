import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { listData } from './routes/latest'

export const app: Express = express()

app.get('/latest', async (req: Request, res: Response) => {
  try {
    const data = await listData()
    res.type('application/xml').status(200).send(data)
  } catch (error) {
    res.send(error)
  }
})

// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running  at https://localhost:${port}`)
// })
