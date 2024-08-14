const core = require("@actions/core");
// const github = require("@actions/github");
const { Octokit } = require("octokit");
const { DefaultArtifactClient } = require("@actions/artifact");

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

  getJobsIfCompleted(token, owner, repo, runId, jobId, 1, max_runs).then(
    (jobs) => {
      // save JSON output of `jobs` to a file called `jobs.json`
      const fs = require("fs");
      const artifact = new DefaultArtifactClient();
      fs.writeFileSync("jobs.json", JSON.stringify(jobs, null, 2));

      const artifactName = "jobs-artifact";
      const files = ["jobs.json"];
      const rootDirectory = ".";
      const options = {};

      artifact
        .uploadArtifact(artifactName, files, rootDirectory, options)
        .then((response) => {
          core.setOutput("jobs-artifact-id", response.id);
        });

        // Remove "jobs.json" file
        fs.unlinkSync("jobs.json");

        // Get the logs
        // downloadJobLogsForWorkflowRun
        // const octokit = new Octokit({ auth: token });
        // for (let job of jobs) {
        //   octokit.rest.actions.downloadJobLogs({
        //     owner: owner,
        //     repo: repo,
        //     job_id: job.id,
        //     archive_format: "zip",
        //   });
        const octokit = new Octokit({ auth: token });
        for (let job of jobs) {
            /* Gets a redirect URL to download a plain text file of logs for a workflow job. This link expires after 1 minute. Look for Location: in the response header to find the URL for the download. */
          octokit.rest.actions.downloadJobLogsForWorkflowRun({
            owner: owner,
            repo: repo,
            job_id: job.id,
            archive_format: "zip",
          });

    }
  );

  const time = new Date().toTimeString();
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}
