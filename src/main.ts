import * as core from '@actions/core'
// import * as github from '@actions/github'
import {Octokit} from 'octokit'
import {DefaultArtifactClient} from '@actions/artifact'

async function getJobsIfCompleted(
  token,
  owner,
  repo,
  run_id,
  job_id,
  i,
  max_runs
) {
  const octokit = await new Octokit({
    auth: token
  })

  const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: owner,
    repo: repo,
    run_id: run_id
  })

  const runningJobs = jobs.data.jobs.filter(job => job.name !== job_id)
  const allJobsCompleted = runningJobs.every(job => job.status === 'completed')

  if (allJobsCompleted || i > max_runs) {
    return runningJobs
  } else {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return await getJobsIfCompleted(
      token,
      owner,
      repo,
      run_id,
      job_id,
      i + 1,
      max_runs
    )
  }
}

async function run(): Promise<void> {
  const token = core.getInput('github-token')
  const [owner, repo] = core.getInput('repo').split('/')
  const runId = core.getInput('workflow-id')
  const jobId = core.getInput('job-id')

  const max_runs = Infinity

  const jobs = await getJobsIfCompleted(
    token,
    owner,
    repo,
    runId,
    jobId,
    1,
    max_runs
  )

  const fs = require('fs')
  const artifact = new DefaultArtifactClient()
  fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2))

  const artifactName = 'jobs-artifact'
  const files = ['jobs.json']
  const rootDirectory = '.'
  const options = {}

  const response = await artifact.uploadArtifact(
    artifactName,
    files,
    rootDirectory,
    options
  )
  core.setOutput('jobs-artifact-id', response.id)
  fs.unlinkSync('jobs.json')
  //   const octokit = new Octokit({auth: token})
  //   for (let job of jobs) {
  //     /* Gets a redirect URL to download a plain text file of logs for a workflow job. This link expires after 1 minute. Look for Location: in the response header to find the URL for the download. */
  //     octokit.rest.actions.downloadJobLogsForWorkflowRun({
  //       owner: owner,
  //       repo: repo,
  //       job_id: job.id,
  //       archive_format: 'zip'
  //     })
  //   }
  const time = new Date().toTimeString()
  core.setOutput('time', time)
}

export default run
