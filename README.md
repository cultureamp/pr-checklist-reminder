# PR Checklist Reminder
This action parses PR description and set commit status to success if there are no unfilled checkboxes
related to Kaizen contributions.

## Using the Action

Create a new workflow YAML file under `.github/workflows/` folder.

Example:

```
name: PR Checklist Reminder

on:
  pull_request:
    types: [opened, synchronize, reopened, edited]

jobs:
  check:

    runs-on: ubuntu-latest

    steps:
    - uses: cultureamp/pr-checklist-reminder@1.0.0
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```
