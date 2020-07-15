# PR Checklist Reminders

This Github Action reminds you to complete required checklist items by setting a (Github error status)[https://developer.github.com/v3/repos/statuses/] for each required checklist item in the PR description that hasn't been checked off.

This is intended to be used in conjunction with a Pull Request Template containing checklist items.

## Using the Action

1. Create a (PR Template)[https://docs.github.com/en/github/building-a-strong-community/creating-a-pull-request-template-for-your-repository] containing some checklist items. When you configure the Github Action you can configure which of these checklist items you would like to make required.


2. Create a new workflow YAML file under `.github/workflows/` folder.

Example:
```
name: PR Checklist Reminders

on:
  pull_request:
    types: [opened, synchronize, reopened, edited]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: cultureamp/pr-checklist-reminders@1.0.0
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        github-status-context: "TODO"
        checklist-item-1: "Get approval from a QA Tester"
        checklist-item-2: "Remove any commented out code"
        checklist-item-3: "Create issues for any TODOs in comments"
```

Only checklist items listed in the config will get Github Status reminders.  You can create up to 5 checklist items, but we recommend no more than 3, or contributors will be likely to ignore them.
