const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("octokit");

async function getJobsIfCompleted(token, owner, repo, run_id, job_id, i, max_runs) {
  console.log("Inside getJobsIfCompleted");
  console.log("token", token, "owner", owner, "repo", repo, "run_id", run_id, "job_id", job_id);
  console.log("Doing the job now");
  const octokit = await new Octokit({
    auth: token,
  });

  const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: owner,
    repo: repo,
    run_id: run_id,
  });

  const runningJobs = jobs.data.jobs.filter((job) => job.name !== job_id);
  const allJobsCompleted = runningJobs.every(
    (job) => job.status === "completed"
  );

  if (allJobsCompleted || i > max_runs) {
    return runningJobs;
  } else {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await getJobsIfCompleted(
      token,
      owner,
      repo,
      run_id,
      job_id,
      i + 1,
      max_runs
    );
  }
}

try {
  // `who-to-greet` input defined in action metadata file

  const token = core.getInput("github-token");
  const owner = core.getInput("repo").split("/")[0];
  const repo = core.getInput("repo").split("/")[1];
  const runId = core.getInput("workflow-id");
  const jobId = core.getInput("job-id");
  const max_runs = Infinity;

  console.log("Inputs: ");
  console.log(token, owner, repo, runId, jobId, 1);

  getJobsIfCompleted(token, owner, repo, runId, jobId, 1, max_runs).then((jobs) => {
    console.log(jobs);
  });

  const time = new Date().toTimeString();
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}
