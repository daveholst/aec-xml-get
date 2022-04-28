import http from 'http'
import { handleSignals } from './utils/signals'
import dotenv from 'dotenv'

import { app } from './app'
dotenv.config()

const port = process.env.PORT || 3000

const server = http.createServer(app)
handleSignals(server)
server.listen(port, function () {
  console.info(`Express is listening to http://0.0.0.0:${port}`)
})
