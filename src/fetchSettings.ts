import { fetchAsJson } from "./fetchAsJson.ts";
import { isRepositorySettings } from "./validations.ts";

export async function fetchSettings(issueOrPR: string, locator: string) {
	const [itemDetails, repositorySettings] = await Promise.all([
		fetchAsJson(`https://api.github.com/repos/${locator}/issues/${issueOrPR}`),
		fetchAsJson(`https://api.github.com/repos/${locator}`),
	]);

	if (!isRepositorySettings(repositorySettings)) {
		console.error("Invalid repository details:", repositorySettings);
		return;
	}

	const { default_branch: defaultBranch } = repositorySettings;

	return { defaultBranch, itemDetails };
}
