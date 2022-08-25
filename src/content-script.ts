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

  // 2. Fetch the repository's .github/replies.yml
  // (no caching because it might change between page loads)
  // TODO: maybe cache for a brief time?
  const userOrOrganization = "JoshuaKGoldberg";
  const repository = "refined-saved-replies";
  const mainBranch = "main";
  const repliesUrl = `https://raw.githubusercontent.com/${userOrOrganization}/${repository}/${mainBranch}/.github/replies.yml`;
  const response = await fetch(repliesUrl);
  const body = await response.text();

  // 3. Parse the body as yml
  const repliesConfiguration = yaml.load(body);
  if (!isBodyWithReplies(repliesConfiguration)) {
    console.error("Invalid saved replies:", repliesConfiguration);
    return;
  }

  // 4. Add a listener to modify the saved reply dropdown upon creation
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
    // TODO: use observer
    while (
      !document.querySelector(
        `markdown-toolbar details-menu[src="/settings/replies?context=issue"]`
      )
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    // 5. Add the new replies to the saved reply dropdown
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
          href: `https://github.com/${userOrOrganization}/${repository}/edit/${mainBranch}/.github/replies.yml`,
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
