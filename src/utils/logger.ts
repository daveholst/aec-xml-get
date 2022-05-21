import pino from 'pino'
export const logger = pino({
  level: 'debug',
  prettyPrint: {
    translateTime: 'SYS:h:MM:ss',
    colorize: true,
    ignore: 'pid,hostname',
  },
})
