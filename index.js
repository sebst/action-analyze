const core = require('@actions/core');
const github = require('@actions/github');
const Octokit = require("@octokit/rest").Octokit;

async function getJobsIfCompleted(token, owner, repo, run_id, job_name) {
    const octokit = await new Octokit({
        auth: token,
    });

    const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
        owner: owner,
        repo: repo,
        run_id: run_id,
    });

    const runningJobs = jobs.data.jobs.filter((job) => job.name !== job_name);
    const allJobsCompleted = runningJobs.every((job) => job.status === "completed");

    if (allJobsCompleted) {
        return runningJobs;
    } else {
        // wait for 5 seconds and check again
        console.log("Waiting for jobs to complete...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const next = await getJobsIfCompleted();
        return next;
    }
}

try {
  // `who-to-greet` input defined in action metadata file

    const token = core.getInput('github-token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const run_id = core.getInput('run-id');


    getJobsIfCompleted(token, owner, repo, run_id, GHA_JOB_NAME).then((jobs) => {
        console.log(jobs);
    });


  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}