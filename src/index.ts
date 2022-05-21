import dotenv from 'dotenv'
import * as cron from 'node-cron'

import { writeAecDataToSheet } from './utils/writeAECToSheet'

import { logger } from './utils/logger'

dotenv.config()
logger.info('AEC Scraper Started')
cron.schedule('*/5 * * * *', writeAecDataToSheet)
