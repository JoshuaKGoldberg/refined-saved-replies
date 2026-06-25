import * as yaml from "js-yaml";

import { BodyWithReplies } from "./types.js";
import { isBodyWithReplies } from "./validations.js";

export type RepliesConfigurationResult =
	| { configuration: BodyWithReplies; type: "success" }
	| { message: string; type: "error" }
	| { type: "notFound" };

export async function fetchRepliesConfiguration(
	defaultBranch: string,
	locator: string,
): Promise<RepliesConfigurationResult> {
	const repliesResponse = await fetch(
		`https://raw.githubusercontent.com/${locator}/${defaultBranch}/.github/replies.yml`,
	);

	if (!repliesResponse.ok) {
		if (repliesResponse.status === 404) {
			return { type: "notFound" };
		}

		console.error(
			"Non-ok response fetching replies:",
			repliesResponse.statusText,
		);

		return { message: repliesResponse.statusText, type: "error" };
	}

	const repliesBody = await repliesResponse.text();

	const repliesConfiguration = yaml.load(repliesBody);

	if (!isBodyWithReplies(repliesConfiguration)) {
		console.error("Invalid saved replies:", repliesConfiguration);

		return { message: "Invalid saved replies configuration.", type: "error" };
	}

	return { configuration: repliesConfiguration, type: "success" };
}
