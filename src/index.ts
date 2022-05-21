import http from 'http'
import { handleSignals } from './utils/signals'
import dotenv from 'dotenv'
import * as cron from 'node-cron'

import { writeAecDataToSheet } from './utils/writeAECToSheet'

import { logger } from './utils/logger'

dotenv.config()
logger.info('AEC Scraper Started')

// const port = process.env.PORT || 3000

// const server = http.createServer(app)
// handleSignals(server)
// // Start the express server
// server.listen(port, function () {
//   console.info(`Express is listening to http://0.0.0.0:${port}`)
// })

// init the cron job to run every 5 minutres
cron.schedule('*/5 * * * *', writeAecDataToSheet)

// writeAecDataToSheet()
