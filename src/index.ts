import * as core from '@actions/core'
import run from './main'

// async function run(): Promise<void> {
//   const nameToGreet = core.getInput('who-to-greet')
//   core.info(`Hello, ${nameToGreet}!`)
//   core.setOutput('greeting', `Hello, ${nameToGreet}!`)
// }

run().catch(error => {
  core.setFailed((error as Error).message)
})
