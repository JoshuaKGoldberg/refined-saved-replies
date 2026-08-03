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
	if (itemDetails.htmlUrl.includes("pull")) {
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

	// Helper function for saved replies functionality on issue pages

	/**
	 * Paste text from description into comment box when reply is clicked
	 * @param {HTMLTextAreaElement} textarea Current textarea state
	 * @param {string} replyBody The text that belongs to the reply
	 * @returns {void}
	 */

	const insertReplyIntoCommentSection = (
		textarea: HTMLTextAreaElement,
		replyBody: string,
	) => {
		const start =
			typeof textarea.selectionStart === "number"
				? textarea.selectionStart
				: textarea.value.length;

		const end =
			typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : start;

		const nextValue = `${textarea.value.slice(0, start)}${replyBody}${textarea.value.slice(end)}`;

		textarea.value = nextValue;
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
		textarea.dispatchEvent(new Event("change", { bubbles: true }));

		textarea.focus();
		const cursorPosition = start + replyBody.length;
		textarea.setSelectionRange(cursorPosition, cursorPosition);
	};

	const onOpenSavedRepliesButtonClick = async () => {
		// 5. Add the new replies to the saved reply dropdown
		// (logic is dependent upon URL including PR or issue)
		if (itemDetails.htmlUrl.includes("pull")) {
			const replyCategoriesDetailsMenus = await getSoon(() => {
				const menus = Array.from(
					document.querySelectorAll(`.Overlay-body .js-saved-reply-menu`),
				)
					.map((element) => element.parentNode)
					.filter((x): x is ParentNode => !!x);

				if (menus.length === 0) {
					return null;
				}

				return menus;
			});
			for (const replyCategoriesDetailsMenu of replyCategoriesDetailsMenus) {
				if (
					replyCategoriesDetailsMenu.querySelector("#repository-replies-label")
				) {
					continue;
				}
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
														children: [
															Mustache.render(reply.body, itemDetails),
														],
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
					modal.classList.replace(
						"Overlay--size-medium",
						"Overlay--size-xlarge",
					);

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
		} else {
			const list = await getSoon(() => {
				const ulElement = document.querySelector(
					'[data-testid="filtered-action-list"]',
				);
				return ulElement?.querySelector(
					"ul.prc-ActionList-ActionList-rPFF2.prc-FilteredActionList-ActionList-3-Bxb",
				) as HTMLUListElement | null;
			});

			// Capture the list length to increment id of new replies
			const listLength = list.children.length;

			if (!list.querySelector("#repository-replies-label")) {
				list.appendChild(
					// TODO: Use the built-in GitHub design system, Primer!
					// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/4
					createElement("li", {
						children: [
							createElement("div", {
								children: ["Repository replies"],
								className: "select-menu-divider my-2",
								id: "repository-replies-label",
							}),
						],
						className: "ActionListItem",
						role: "none",
					}),
				);
			}

			let dataId = listLength;
			for (const reply of repliesConfiguration.replies) {
				const id = `_r_${String(listLength)}_`;

				const repoReply = createElement("li", {
					"aria-selected": false,
					children: [
						createElement("div", {
							children: [
								createElement("span", {
									className: "prc-ActionList-Spacer-4tR2m",
								}),
								createElement("span", {
									children: [
										createElement("span", {
											children: [],
											className: "prc-ActionList-SingleSelectCheckmark-zMd8d",
										}),
									],
									className:
										"prc-ActionList-LeadingAction-hbWbh prc-ActionList-VisualWrap-bdCsS",
									"data-component": "ActionList.Selection",
								}),
								createElement("span", {
									children: [
										createElement("div", {
											children: [
												createElement("span", {
													children: [Mustache.render(reply.name, itemDetails)],
													className: "prc-ActionList-ItemLabel-81ohH",
													"data-component": "ActionList.Item.Label",
													id: `${id}--label`,
												}),
												createElement("span", {
													children: [Mustache.render(reply.body, itemDetails)],
													className: "prc-ActionList-Description-Z-EZJ",
													"data-component": "ActionList.Description",
													id: `${id}--block-description`,
												}),
											],
											className: "prc-ActionList-ItemDescriptionWrap-ujC8S",
											"data-description-variant": "block",
										}),
										createElement("span", {
											children: [""],
											className:
												"prc-ActionList-TrailingVisual-jwT9C prc-ActionList-VisualWrap-bdCsS",
											"data-component": "ActionList.TrailingVisual",
											id: `${id}--trailing-visual`,
										}),
									],
									className: "prc-ActionList-ActionListSubContent-gKsFp",
									"data-component": "ActionList.Item--DividerContainer",
								}),
							],
							className: "prc-ActionList-ActionListContent-KBb8-",
							"data-size": "medium",
						}),
					],
					className:
						"prc-ActionList-ActionListItem-So4vC SavedReplies-module__SavedReplies__yokyN",
					"data-component": "ActionList.Item",
					"data-first-child": "",
					"data-has-description": "true",
					"data-id": String(dataId),
					id,
					role: "option",
					tabindex: -1,
				});

				repoReply.addEventListener("click", (event) => {
					event.preventDefault();
					insertReplyIntoCommentSection(
						newCommentField,
						Mustache.render(reply.body, itemDetails),
					);
					const popup = repoReply.closest(
						"[role='dialog'], [role='menu'], [data-testid='filtered-action-list']",
					);
					popup?.dispatchEvent(
						new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
					);
				});

				list.appendChild(repoReply);
				dataId += 1;
			}

			// 6. Add a second button at the bottom of the modal for adding more
			// TODO: thanks for the heads up @keithamus :)
			// https://github.com/primer/view_components/pull/2364
			const wrapperDiv = await getSoon(() => {
				const wrapper = document.querySelector(
					"div.prc-SelectPanel-Wrapper-OD-e6",
				);
				return wrapper;
			});

			// Also, because the modal is by default too tiny, let's make it bigger
			const modal = wrapperDiv.closest('[role="dialog"]');
			if (!(modal instanceof HTMLElement)) {
				return;
			}

			modal.style.setProperty("height", "40vh", "important");
			modal.style.setProperty("max-height", "40vh", "important");

			wrapperDiv.appendChild(
				createElement("div", {
					children: [
						createElement("div", {
							children: [
								createElement("a", {
									children: [
										createElement("span", {
											children: [
												createElement("span", {
													children: ["Create a new repository reply"],
													className: "prc-Button-Label-FWkx3",
													"data-component": "text",
												}),
											],
											className: "prc-Button-ButtonContent-Iohp5",
											"data-align": "center",
											"data-component": "buttonContent",
										}),
									],
									className: "prc-Button-ButtonBase-9n-Xk",
									"data-block": "block",
									"data-component": "SelectPanel.SecondaryActionLink",
									"data-loading": "false",
									"data-no-visuals": "true",
									"data-size": "medium",
									"data-variant": "invisible",
									href: `https://github.com/${userOrOrganization}/${repository}/edit/${defaultBranch}/.github/replies.yml`,
									target: "_blank",
								}),
							],
							className: "prc-SelectPanel-SecondaryAction-AFlHt",
							"data-component": "SelectPanel.SecondaryAction",
							"data-stretch-secondary-action": "always",
						}),
					],
					className:
						"prc-SelectPanel-Footer-Rxa8K prc-SelectPanel-ResponsiveFooter-qnA4v",
					"data-component": "SelectPanel.Footer",
					"data-display-footer": "always",
					"data-stretch-save-button": "never",
					"data-stretch-secondary-action": "always",
				}),
			);
		}
	};

	// 7. Add a listener to modify the saved reply dropdown upon creation
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
