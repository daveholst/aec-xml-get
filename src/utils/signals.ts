import http from 'http'

// Stole this from WAN repo - topkeek
export function handleSignals(server: http.Server) {
  // The signals we want to handle
  // NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
  const signals = {
    SIGHUP: 1,
    SIGINT: 2,
    SIGTERM: 15,
    SIGUSR2: 5, // No idea what these numbers mean =/
  } // Do any necessary shutdown logic for our application here
  const shutdown = (signal: string, value: number) => {
    console.log('shutdown!')
    server.close(() => {
      console.log(`server stopped by ${signal} with value ${value}`)
      process.exit(0)
    })
  } // Create a listener for each of the signals that we want to handle
  Object.keys(signals).forEach((signal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.on(signal as any, () => {
      console.log(`process received a ${signal} signal`)
      shutdown(signal, (signals as any)[signal])
    })
  })
}
