import express, { Express, Request, Response } from 'express'
import { latestHandler } from './routes/latest'
import { latestJsonHandler } from './routes/latest-json'
import { cleanDataHandler } from './routes/clean-data'

export const app: Express = express()

app.get('/latest', async (req: Request, res: Response) => {
  latestHandler(req, res)
})

app.get('/latest-json', async (req: Request, res: Response) => {
  latestJsonHandler(req, res)
})
app.get('/clean-data', async (req: Request, res: Response) => {
  cleanDataHandler(req, res)
})
