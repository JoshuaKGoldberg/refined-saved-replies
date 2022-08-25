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
  const repliesConfiguration = yaml.load(body);
  if (!isBodyWithReplies(repliesConfiguration)) {
    console.error("Invalid saved replies:", repliesConfiguration);
    return;
  }

  // 4. Add a listener to modify the saved reply dropdown upon creation
  const openSavedRepliesButton = document.getElementById(
    "saved-reply-new_comment_field"
  );
  if (!openSavedRepliesButton) {
    console.error("Couldn't find clicker");
    return;
  }
  // TODO: actually hook this up to DOM event listeners? onclick?
  openSavedRepliesButton.addEventListener("click", () => {
    // 5. Add the new replies to the saved reply dropdown
    // TODO: is this specific enough?
    const replyCategoriesList = document.querySelector(
      "markdown-toolbar fuzzy-list ul"
    );
    if (!replyCategoriesList) {
      console.error("could not find fuzzy list :(");
      return;
    }

    // TODO: Investigate using a UI framework or similar?
    const divider = document.createElement("div");
    divider.className = "select-menu-divider js-divider";
    divider.textContent = "Repository replies";

    // TODO: add before defaults?
    replyCategoriesList.append(
      divider,
      // TODO: styling
      // TODO: also this was messing up the list
      ...repliesConfiguration.replies.map((reply) => {
        const listItem = document.createElement("li");
        listItem.setAttribute("data-value", reply.name);

        const button = document.createElement("button");
        button.textContent = "ugh";

        button.addEventListener("click", (event) => {
          event.preventDefault();

          // TODO: search for this once, not on click
          (
            document.getElementById("new_comment_field") as HTMLTextAreaElement
          ).value += reply.body;
        });

        listItem.appendChild(button);

        return listItem;
      })
    );
  });
})().catch((error) => {
  console.error("Oh no!", error);
});
