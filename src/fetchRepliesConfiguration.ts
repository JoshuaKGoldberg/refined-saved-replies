import * as yaml from "js-yaml";

import { isBodyWithReplies } from "./validations.js";

export async function fetchRepliesConfiguration(
	defaultBranch: string,
	locator: string,
) {
	const repliesResponse = await fetch(
		`https://raw.githubusercontent.com/${locator}/${defaultBranch}/.github/replies.yml`,
	);

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

	const repliesConfiguration = yaml.load(repliesBody);

	if (!isBodyWithReplies(repliesConfiguration)) {
		console.error("Invalid saved replies:", repliesConfiguration);
		return;
	}

	return repliesConfiguration;
}
