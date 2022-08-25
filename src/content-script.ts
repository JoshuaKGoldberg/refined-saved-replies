import * as yaml from "js-yaml";
import { createElement } from "./elements";

import { isBodyWithReplies } from "./validations";

(async function main() {
  if (window.location.toString().includes("nope")) return;

  // 1. Is this an issue I can reply to?
  // (if not, exit from the page)
  const replySummary = document.getElementById("saved-reply-new_comment_field");
  if (!replySummary) {
    return;
  }

  // 2. Fetch the repository's default branch, to retrieve replies.yml from
  const { default_branch: defaultBranch } = await (
    await fetch(
      `https://api.github.com/repos/${userOrOrganization}/${repository}`
    )
  ).json();

  // 3. Fetch the repository's .github/replies.yml
  const [, userOrOrganization, repository] =
    window.location.pathname.split("/");
  const repliesUrl = `https://raw.githubusercontent.com/${userOrOrganization}/${repository}/${defaultBranch}/.github/replies.yml`;
  const repliesResponse = await fetch(repliesUrl);
  const repliesBody = await repliesResponse.text();

  // 4. Parse the replies body as yml
  const repliesConfiguration = yaml.load(repliesBody);
  if (!isBodyWithReplies(repliesConfiguration)) {
    console.error("Invalid saved replies:", repliesConfiguration);
    return;
  }

  // 5. Add a listener to modify the saved reply dropdown upon creation
  const newCommentField = document.getElementById(
    "new_comment_field"
  ) as HTMLTextAreaElement;
  if (!newCommentField) {
    console.error("Couldn't find comment field");
    return;
  }
  const openSavedRepliesButton = document.getElementById(
    "saved-reply-new_comment_field"
  );
  if (!openSavedRepliesButton) {
    console.error("Couldn't find clicker");
    return;
  }

  const onOpenSavedRepliesButtonClick = async () => {
    // 6. Add the new replies to the saved reply dropdown
    const replyCategoriesDetailsMenus = document.querySelectorAll(
      `markdown-toolbar details-menu[src="/settings/replies?context=issue"]`
    );

    for (const replyCategoriesDetailsMenu of replyCategoriesDetailsMenus) {
      replyCategoriesDetailsMenu.appendChild(
        createElement("div", {
          children: ["Repository replies"],
          className: "select-menu-divider js-divider",
        })
      );

      for (const reply of repliesConfiguration.replies) {
        const button = createElement("button", {
          children: [
            createElement("div", {
              children: [
                createElement("div", {
                  children: [
                    createElement("span", {
                      children: reply.name,
                      className:
                        "select-menu-item-heading css-truncate css-truncate-target",
                    }),
                    createElement("span", {
                      children: reply.body,
                      className:
                        "description css-truncate css-truncate-target js-saved-reply-body",
                    }),
                  ],
                  className: "flex-auto col-9",
                }),
              ],
              className: "select-menu-item-text d-flex flex-items-center",
            }),
          ],
          className: "select-menu-item width-full",
          role: "menuitem",
          type: "button",
          value: "",
        });

        // It looks like GitHub's built-in clicking logic already sets up this listener.
        button.addEventListener("click", (event) => {
          event.preventDefault();
        });

        replyCategoriesDetailsMenu.appendChild(
          createElement("ul", {
            children: [
              createElement("li", { children: [button], role: "none" }),
            ],
            role: "none",
          })
        );
      }

      replyCategoriesDetailsMenu.appendChild(
        createElement("a", {
          children: [
            createElement("span", {
              children: ["Create a new repository reply..."],
              class: "select-menu-item-text",
            }),
          ],
          class: "select-menu-item select-menu-action",
          href: `https://github.com/${userOrOrganization}/${repository}/edit/${defaultBranch}/.github/replies.yml`,
          role: "menuitem",
          target: "_blank",
        })
      );
    }

    openSavedRepliesButton.removeEventListener(
      "click",
      onOpenSavedRepliesButtonClick
    );
  };
  openSavedRepliesButton.addEventListener(
    "click",
    onOpenSavedRepliesButtonClick
  );
})().catch((error) => {
  console.error("Oh no!", error);
});
