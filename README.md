# Workflow Analyze Action

This Action collects the stats of a workflow and the logs for each step.

> [!TIP]
> Learn more about why this is helpful on the [blog post](https://bas.surf/action-analyze).

## Inputs


### `github-token`

**Required** Desc. of the input

### `repo`

**Required** Desc. of the input

### `workflow-id`

**Required** Desc. of the input

### `job-id`

**Required** Desc. of the input


## Outputs

### `time`

The time we greeted you.

## Example usage

> [!CAUTION]
> Do not assign a name to the job that uses this action. The action will run infinitely if you do.


```yaml
on:
  workflow_dispatch:

jobs:
  run_the_test:
    runs-on: ubuntu-latest
    steps:
      - name: Sleep 20
        run: sleep 20
  analyze_job:
    runs-on: ubuntu-latest
    steps:
      - uses: sebst/action-analyze@v2
        with:
          github-token: ${{ secrets.GHA_PAT }}
          repo: ${{ github.repository }}
          workflow-id: ${{ github.run_id }}
          job-id: ${{ github.job }}
```