import * as yaml from "js-yaml";
import Mustache from "mustache";

import { createElement } from "./elements";
import { isBodyWithReplies, isRepositoryDetails } from "./validations";

document.addEventListener("soft-nav:end", main);

async function main() {
	const openSavedRepliesButton = document.getElementById(
		"saved-reply-new_comment_field"
	);

	// 1. Is this an issue I can reply to?
	// (if not, exit from the page)
	if (!openSavedRepliesButton) {
		return;
	}

	// 2. Fetch the repository's default branch, to retrieve replies.yml from
	const [, userOrOrganization, repository, , issueOrPR] =
		window.location.pathname.split("/");
	const repositoryDetails = (await (
		await fetch(
			`https://api.github.com/repos/${userOrOrganization}/${repository}`
		)
	).json()) as unknown;
	if (!isRepositoryDetails(repositoryDetails)) {
		console.error("Invalid repository details:", repositoryDetails);
		return;
	}
	const { default_branch: defaultBranch } = repositoryDetails;

	// 3. Fetch the REST API's JSON description of the item
	const details = (await (
		await fetch(
			`https://api.github.com/repos/${userOrOrganization}/${repository}/issues/${issueOrPR}`
		)
	).json()) as unknown;

	// 4. Fetch the repository's .github/replies.yml
	const repliesUrl = `https://raw.githubusercontent.com/${userOrOrganization}/${repository}/${defaultBranch}/.github/replies.yml`;
	const repliesResponse = await fetch(repliesUrl);

	if (!repliesResponse.ok) {
		if (repliesResponse.status !== 404) {
			console.error(
				"Non-ok response fetching replies:",
				repliesResponse.statusText
			);
		}
		return;
	}

	const repliesBody = await repliesResponse.text();

	// 5. Parse the replies body as yml
	const repliesConfiguration = yaml.load(repliesBody);
	if (!isBodyWithReplies(repliesConfiguration)) {
		console.error("Invalid saved replies:", repliesConfiguration);
		return;
	}

	// 6. Add a listener to modify the saved reply dropdown upon creation
	const newCommentField = document.getElementById("new_comment_field") as
		| HTMLTextAreaElement
		| undefined;
	if (!newCommentField) {
		console.error("Couldn't find comment field");
		return;
	}

	const onOpenSavedRepliesButtonClick = () => {
		// 7. Add the new replies to the saved reply dropdown
		const replyCategoriesDetailsMenus = document.querySelectorAll(
			`markdown-toolbar details-menu[src^="/settings/replies?context="]`
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
											children: [Mustache.render(reply.name, details)],
											className:
												"select-menu-item-heading css-truncate css-truncate-target",
										}),
										createElement("span", {
											children: [Mustache.render(reply.body, details)],
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
							className: "select-menu-item-text",
						}),
					],
					className: "select-menu-item select-menu-action",
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
}

main().catch((error) => {
	console.error("Oh no!", error);
});
