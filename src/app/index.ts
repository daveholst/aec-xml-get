import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { latestHandler } from './routes/latest'
import { latestJsonHandler } from './routes/latest-json'

export const app: Express = express()

app.get('/latest', async (req: Request, res: Response) => {
  latestHandler(req, res)
})

app.get('/latest-json', async (req: Request, res: Response) => {
  latestJsonHandler(req, res)
})
