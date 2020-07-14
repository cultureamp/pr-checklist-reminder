import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const args = getAndValidateArgs();
    const client = new github.GitHub(args.repoToken);
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      throw new Error("Payload is missing pull_request.");
    }
    const checklistItems = joinWithWhitelist(
      parseMarkdownChecklistItems(pullRequest.body || ""),
      makeWhitelistFromArgs(args)
    );
    const specs = getGithubStatusSpecs(checklistItems);
    let i = 1;
    for (const spec of specs) {
      const context = `Kaizen Contributor TODO (${i})`;
      await createGithubStatus({ pullRequest, client, spec, context });
      i++;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
async function createGithubStatus({ pullRequest, client, spec, context }) {
  return client.repos.createStatus({
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    sha: pullRequest.head.sha,
    state: spec.success ? "success" : "error",
    description: spec.description,
    context: context
  });
}

export type Args = {
  repoToken: string;
  checklistItem1: string;
  checklistItem2: string;
  checklistItem3: string;
  checklistItem4: string;
  checklistItem5: string;
};

function getAndValidateArgs(): Args {
  return {
    repoToken: core.getInput("repo-token", { required: true }),
    checklistItem1: core.getInput("checklist-item-1", { required: false }),
    checklistItem2: core.getInput("checklist-item-2", { required: false }),
    checklistItem3: core.getInput("checklist-item-3", { required: false }),
    checklistItem4: core.getInput("checklist-item-4", { required: false }),
    checklistItem5: core.getInput("checklist-item-5", { required: false })
  };
}

export function truncateDescriptionToMeetGithubRequirements(
  description: string
): string {
  const maxGithubCheckDescriptionLength = 140;
  return description.slice(0, maxGithubCheckDescriptionLength);
}

type ChecklistItem = { description: string; checked: boolean };

export function parseMarkdownChecklistItems(
  markdown: string
): Array<ChecklistItem> {
  const lines = markdown.split(/\r?\n/);
  return lines.map(parseMarkdownChecklistItem).filter(notNull);
}

function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null;
}

export function parseMarkdownChecklistItem(
  markdown: string
): (ChecklistItem | null) {
  const regex = /^\- \[( |x)\] (.*)/;
  const matches = regex.exec(markdown);
  if (matches) {
    return { description: matches[2].trim(), checked: matches[1] === "x" };
  } else {
    return null;
  }
}

export function joinWithWhitelist(
  checklistItems: Array<ChecklistItem>,
  whitelist: string[]
): Array<ChecklistItem> {
  return whitelist.map(whitelistDescription => {
    const checklistItem = findChecklistItem(
      checklistItems,
      whitelistDescription
    );
    if (checklistItem !== undefined) {
      return checklistItem;
    } else {
      /* Missing whitelist checkbox items are always set to true. This is to avoid an
       * edge case where it would be impossible to merge the PR: if the PR initially
       * has unchecked checkboxes, and then they are deleted from the description, there
       * will be no way to set the already generated Github Status to success. Setting
       * deleted checklist items to success will make the PR mergeable*/
      return { description: whitelistDescription, checked: true };
    }
  });
}

export function findChecklistItem(
  checklistItems: Array<ChecklistItem>,
  description: string
): ChecklistItem | undefined {
  return checklistItems.find(item => {
    return item.description.trim().startsWith(description.trim());
  });
}

type GithubStatusSpec = { description: string; success: boolean; id: number };
export function getGithubStatusSpecs(
  checklistItems: Array<ChecklistItem>
): Array<GithubStatusSpec> {
  return checklistItems.map(({ description, checked }, index) => ({
    description: truncateDescriptionToMeetGithubRequirements(description),
    success: checked,
    id: index + 1
  }));
}

export function makeWhitelistFromArgs(args: Args): string[] {
  const checklistItemKeys = [
    "checklistItem1",
    "checklistItem2",
    "checklistItem3",
    "checklistItem4",
    "checklistItem5"
  ];
  const reducer = (accumulator: string[], argKey: string) => {
    const suppliedValue = args[argKey];
    return suppliedValue ? accumulator.concat(suppliedValue) : accumulator;
  };
  return checklistItemKeys.reduce(reducer, []);
}

run();
