"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
// import * as github from '@actions/github'
const rest_1 = require("@octokit/rest");
const artifact_1 = require("@actions/artifact");
function getJobsIfCompleted(token, owner, repo, run_id, job_id, i, max_runs) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = yield new rest_1.Octokit({
            auth: token
        });
        const jobs = yield octokit.rest.actions.listJobsForWorkflowRun({
            owner: owner,
            repo: repo,
            run_id: run_id
        });
        const runningJobs = jobs.data.jobs.filter(job => job.name !== job_id);
        const allJobsCompleted = runningJobs.every(job => job.status === 'completed');
        if (allJobsCompleted || i > max_runs) {
            return runningJobs;
        }
        else {
            yield new Promise(resolve => setTimeout(resolve, 5000));
            return yield getJobsIfCompleted(token, owner, repo, run_id, job_id, i + 1, max_runs);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = core.getInput('github-token');
        const [owner, repo] = core.getInput('repo').split('/');
        const runId = core.getInput('workflow-id');
        const jobId = core.getInput('job-id');
        const max_runs = Infinity;
        const jobs = yield getJobsIfCompleted(token, owner, repo, runId, jobId, 1, max_runs);
        const fs = require('fs');
        const artifact = new artifact_1.DefaultArtifactClient();
        fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));
        const artifactName = 'jobs-artifact';
        const files = ['jobs.json'];
        const rootDirectory = '.';
        const options = {};
        const response = yield artifact.uploadArtifact(artifactName, files, rootDirectory, options);
        core.setOutput('jobs-artifact-id', response.id);
        fs.unlinkSync('jobs.json');
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
        const time = new Date().toTimeString();
        core.setOutput('time', time);
    });
}
exports.default = run;
//# sourceMappingURL=main.js.map