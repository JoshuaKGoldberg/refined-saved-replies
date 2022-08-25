import * as yaml from "js-yaml";

import { isBodyWithReplies } from "./validations";

(async function main() {
  // 1. Is this an issue I can reply to?
  // (if not, exit from the page)
  const replySummary = document.getElementById("saved-reply-new_comment_field");
  if (!replySummary) {
    return;
  }

  // 2. Fetch the repository's .github/replies.yml
  // (no caching because it might change between page loads)
  // TODO: maybe cache for a brief time?
  const userOrOrganization = "JoshuaKGoldberg";
  const repository = "refined-saved-replies";
  const branch = "main";
  const repliesUrl = `https://raw.githubusercontent.com/${userOrOrganization}/${repository}/${branch}/.github/replies.yml`;
  const response = await fetch(repliesUrl);
  const body = await response.text();

  // 3. Parse the body as yml
  const loaded = yaml.load(body);
  if (!isBodyWithReplies(loaded)) {
    // TODO: error case handling?
    console.error("Invalid saved replies:", loaded);
    return;
  }
  console.log({ loaded });

  // 4. Add the new replies to the saved reply dropdown
})().catch((error) => {
  console.error("Oh no!", error);
});
