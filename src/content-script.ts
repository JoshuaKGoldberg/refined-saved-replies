import * as yaml from "js-yaml";
import Mustache from "mustache";

import { createElement } from "./elements.js";
import { isBodyWithReplies, isRepositoryDetails } from "./validations.js";

// TODO: Add handling for a rejection?
// eslint-disable-next-line @typescript-eslint/no-misused-promises
document.addEventListener("soft-nav:end", main);

async function main() {
	const openSavedRepliesButton = document.querySelector(
		`[data-show-dialog-id="saved_replies_menu_new_comment_field-dialog"]`,
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
			`https://api.github.com/repos/${userOrOrganization}/${repository}`,
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
			`https://api.github.com/repos/${userOrOrganization}/${repository}/issues/${issueOrPR}`,
		)
	).json()) as unknown;

	// 4. Fetch the repository's .github/replies.yml
	const repliesUrl = `https://raw.githubusercontent.com/${userOrOrganization}/${repository}/${defaultBranch}/.github/replies.yml`;
	const repliesResponse = await fetch(repliesUrl);

	if (!repliesResponse.ok) {
		if (repliesResponse.status !== 404) {
			console.error(
				"Non-ok response fetching replies:",
				repliesResponse.statusText,
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

	// As a precaution, don't continue if there's no comment field to reply in
	const newCommentField = document.getElementById("new_comment_field") as
		| HTMLTextAreaElement
		| undefined;
	if (!newCommentField) {
		console.error("Couldn't find comment field");
		return;
	}

	async function getSoon<T extends { length: number }>(callback: () => T) {
		for (let i = 0; i < 10; i += 1) {
			const result = callback();
			if (result.length) {
				return result;
			}

			await new Promise((resolve) => setTimeout(resolve, i ** 2));
		}

		// TODO: think of async handling
		throw new Error(`Never found :(`);
	}

	const onOpenSavedRepliesButtonClick = async () => {
		console.log("Clicked?");
		// 7. Add the new replies to the saved reply dropdown
		const replyCategoriesDetailsMenus = await getSoon(() =>
			document.querySelectorAll(
				`div.Overlay-body fuzzy-list focus-group div[data-view-component]`,
			),
		);
		console.log({ replyCategoriesDetailsMenus });

		for (const replyCategoriesDetailsMenu of replyCategoriesDetailsMenus) {
			console.log({ replyCategoriesDetailsMenu });
			replyCategoriesDetailsMenu.appendChild(
				// todo: is there a better way?
				createElement("div", {
					children: ["Repository replies"],
					className: "select-menu-divider my-2",
					id: "repository-replies-label",
				}),
			);

			for (const reply of repliesConfiguration.replies) {
				const button = createElement("button", {
					children: [
						createElement("div", {
							children: [
								createElement("span", {
									children: [
										createElement("span", {
											children: [Mustache.render(reply.name, details)],
											className:
												"ActionListItem-label ActionListItem-label--truncate",
											"data-view-component": true,
										}),
										createElement("span", {
											children: [
												createElement("span", {
													// id: "..."
													"aria-hidden": true,
													children: [
														createElement("span", {
															children: [Mustache.render(reply.body, details)],
															"data-view-component": true,
														}),
													],
													className: "Truncate js-saved-reply-body",
													"data-view-component": true,
												}),
											],
											className: "ActionListItem-description",
										}),
									],
									className: "ActionListItem-descriptionwrap",
									"data-view-component": true,
								}),
								// TODO: Add support for shortcuts?
								// createElement("span", {
								// 	className: "ActionListItem-visual--trailing",
								// }),
							],
							className: "select-menu-item-text d-flex flex-items-center",
						}),
					],
					className: "ActionListContent",
					role: "menuitem",
					type: "button",
				});

				// It looks like GitHub's built-in clicking logic already sets up this listener.
				button.addEventListener("click", (event) => {
					event.preventDefault();
				});

				replyCategoriesDetailsMenu.appendChild(
					createElement("ul", {
						"aria-labelled-by": "repository-replies-label",
						children: [
							createElement("li", {
								children: [button],
								role: "none",
							}),
						],
						className: "js-saved-reply-menu ActionListWrap",
						role: "list",
					}),
				);
			}

			// 8. Add a second button at the bottom of the modal for adding more
			for (const modal of Array.from(
				document.querySelectorAll<HTMLElement>(
					"modal-dialog#saved_replies_menu_new_comment_field-dialog",
				),
			)) {
				console.log({ modal });
				// Also, because the modal is by default too tiny, let's make it bigger
				modal.style.height = "100%";
				modal.style.maxHeight = "calc(100vh - 5rem)";

				// TODO: think of async flow better
				setTimeout(() => {
					modal.appendChild(
						createElement("div", {
							children: [
								createElement("a", {
									children: [
										createElement("span", {
											children: [
												// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
												modal
													.querySelector(
														"a .Button-visual.Button-leadingVisual",
													)!
													.cloneNode(true),
												createElement("span", {
													children: ["Create a new repository reply"],
													className: "Button-label",
												}),
											],
											className: "Button-content Button-content--alignStart",
										}),
									],
									className:
										"Button--invisible Button--medium Button Button--fullWidth",
									"data-view-component": true,
									href: `https://github.com/${userOrOrganization}/${repository}/edit/${defaultBranch}/.github/replies.yml`,
									target: "_blank",
								}),
							],
							className:
								"Overlay-footer Overlay-footer--alignEnd Overlay-footer--divided",
							"data-view-component": true,
						}),
					);
				});
			}
			/*
	<div >
		<a href="/settings/replies?return_to=1" data-view-component="true" class="Button--invisible Button--medium Button Button--fullWidth">
			<span class="Button-content Button-content--alignStart">
				<span class="Button-visual Button-leadingVisual">
					<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-plus">
						<path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
					</svg>
				</span>
				<span class="Button-label">Create a new saved reply</span>
			</span>
		</a>
	</div>
*/
		}

		openSavedRepliesButton.removeEventListener(
			"click",
			onOpenSavedRepliesButtonClick,
		);
	};

	// 6. Add a listener to modify the saved reply dropdown upon creation
	openSavedRepliesButton.addEventListener(
		"click",
		onOpenSavedRepliesButtonClick,
	);

	// openSavedRepliesButton.addEventListener("click", () => {
	// });
}

main().catch((error) => {
	console.error("Oh no!", error);
});
