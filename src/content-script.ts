import Mustache from "mustache";

import { createElement } from "./elements.js";
import { fetchRepliesConfiguration } from "./fetchRepliesConfiguration.js";
import { fetchSettings } from "./fetchSettings.js";
import { getSoon } from "./getSoon.js";

// TODO: Add handling for a rejection
// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/2
// eslint-disable-next-line @typescript-eslint/no-misused-promises
document.addEventListener("soft-nav:end", main);

async function main() {
	// 1. Query for the Saved Replies button
	let openSavedRepliesButton: Element | null = null;
	try {
		openSavedRepliesButton = await getSoon(() =>
			document.querySelector(`button:has(.octicon-reply)`),
		);
	} catch {
		return;
	}

	const [, userOrOrganization, repository, , issueOrPR] =
		window.location.pathname.split("/");
	const locator = `${userOrOrganization}/${repository}`;

	// 2. Fetch the REST API's JSON descriptions of the item and the repository's settings
	const settings = await fetchSettings(issueOrPR, locator);
	if (!settings) {
		return;
	}

	const { defaultBranch, itemDetails } = settings;

	// 3. Fetch the repository's .github/replies.yml configuration
	const repliesConfiguration = await fetchRepliesConfiguration(
		defaultBranch,
		locator,
	);
	if (!repliesConfiguration) {
		return;
	}

	// 4. As a precaution, don't continue if there's no comment field to reply in
	let commentField: HTMLTextAreaElement | undefined = undefined;
	if (itemDetails.html_url.includes("pull")) {
		commentField = document.getElementById("new_comment_field") as
			| HTMLTextAreaElement
			| undefined;
	} else {
		commentField = document.querySelector(
			`textarea.prc-Textarea-TextArea-snlco[aria-labelledby="comment-composer-heading"]`,
		) as HTMLTextAreaElement | undefined;
	}
	const newCommentField = commentField;
	if (!newCommentField) {
		console.error("Couldn't find comment field");
		return;
	}

	// Create separate section of code for issues and pull requests to match GitHub structure
	const onOpenSavedRepliesButtonClick = async () => {
		// 5. Add the new replies to the saved reply dropdown
		const replyCategoriesDetailsMenus = await getSoon(() => {
			if (itemDetails.html_url.includes("pull")) {
				const menus = Array.from(
					document.querySelectorAll(`.Overlay-body .js-saved-reply-menu`),
				)
					.map((element) => element.parentNode)
					.filter((x): x is ParentNode => !!x);

				if (menus.length === 0) {
					return null;
				}

				return menus;
			} else {
				const menus = Array.from(
					document.querySelectorAll(
						`.prc-FilteredActionList-Container-647gF .prc-ActionList-ActionList-rPFF2`,
					),
				)
					.map((element) => element.parentNode)
					.filter((x): x is ParentNode => !!x);

				if (menus.length === 0) {
					return null;
				}

				return menus;
			}
		});

		for (const replyCategoriesDetailsMenu of replyCategoriesDetailsMenus) {
			replyCategoriesDetailsMenu.appendChild(
				// TODO: Use the built-in GitHub design system, Primer!
				// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/4
				createElement("div", {
					children: ["Repository replies"],
					className: "select-menu-divider my-2",
					id: "repository-replies-label",
				}),
			);

			for (const reply of repliesConfiguration.replies) {
				const button = createElement("button", {
					children: [
						createElement("span", {
							children: [
								createElement("span", {
									children: [Mustache.render(reply.name, itemDetails)],
									className:
										"ActionListItem-label ActionListItem-label--truncate",
									"data-view-component": true,
								}),
								createElement("span", {
									children: [
										createElement("span", {
											"aria-hidden": true,
											children: [
												createElement("span", {
													children: [Mustache.render(reply.body, itemDetails)],
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
							className: "ActionListItem-descriptionWrap",
							"data-view-component": true,
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
								className: "ActionListItem",
								"data-targets": "action-list.items",
								role: "none",
							}),
						],
						className: "js-saved-reply-menu ActionListWrap",
						"data-view-component": true,
						role: "list",
					}),
				);
			}

			// 6. Add a second button at the bottom of the modal for adding more
			// TODO: thanks for the heads up @keithamus :)
			// https://github.com/primer/view_components/pull/2364
			for (const modal of Array.from(
				document.querySelectorAll<HTMLElement>(
					":where(modal-dialog, dialog).js-saved-reply-container",
				),
			)) {
				// Also, because the modal is by default too tiny, let's make it bigger
				modal.classList.replace("Overlay--size-medium", "Overlay--size-xlarge");

				// There should already be a "new reply" button; add an equivalent
				// button for adding a new saved reply
				const plusIcon = await getSoon(() =>
					modal.querySelector("a .Button-visual.Button-leadingVisual"),
				);

				modal.appendChild(
					createElement("div", {
						children: [
							createElement("a", {
								children: [
									createElement("span", {
										children: [
											plusIcon.cloneNode(true),
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
			}
		}

		openSavedRepliesButton.removeEventListener(
			"click",
			// TODO: Add handling for a rejection
			// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/2
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			onOpenSavedRepliesButtonClick,
		);
	};

	// 4. Add a listener to modify the saved reply dropdown upon creation
	openSavedRepliesButton.addEventListener(
		"click",
		// TODO: Add handling for a rejection
		// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/2
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		onOpenSavedRepliesButtonClick,
	);
}

main().catch((error: unknown) => {
	console.error("Oh no!", error);
});
