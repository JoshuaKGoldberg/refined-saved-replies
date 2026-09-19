import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchSettings } from "./fetchSettings.js";

const mockFetchAsJson = vi.fn();

vi.mock("./fetchAsJson.js", () => ({
	get fetchAsJson() {
		return mockFetchAsJson;
	},
}));

const mockError = vi.fn();

describe("fetchSettings", () => {
	beforeEach(() => {
		mockFetchAsJson.mockReset();
		mockError.mockReset();
		globalThis.console.error = mockError;
	});

	it("returns undefined and console errors when the repository settings are invalid", async () => {
		const itemDetails = { html_url: "https://github.com/user1/issues/1" };
		const repositorySettings = { invalid: true };

		mockFetchAsJson
			.mockResolvedValueOnce(itemDetails)
			.mockResolvedValueOnce(repositorySettings);

		const actual = await fetchSettings("", "");

		expect(actual).toBeUndefined();
		expect(mockError).toHaveBeenCalledWith(
			"Invalid repository details:",
			repositorySettings,
		);
	});

	it("returns the default branch and item details when the repository settings are valid", async () => {
		const defaultBranch = "some-branch";
		const itemDetails = { html_url: "https://github.com/user1/issues/1" };
		const repositorySettings = { default_branch: defaultBranch };

		mockFetchAsJson
			.mockResolvedValueOnce(itemDetails)
			.mockResolvedValueOnce(repositorySettings);

		const actual = await fetchSettings("", "");

		expect(actual).toEqual({
			defaultBranch,
			itemDetails: { htmlUrl: itemDetails.html_url },
		});
		expect(mockError).not.toHaveBeenCalled();
	});

	it("returns undefined and console errors when the item details are invalid", async () => {
		const itemDetails = { invalid: true };
		const repositorySettings = { default_branch: "some-branch" };

		mockFetchAsJson
			.mockResolvedValueOnce(itemDetails)
			.mockResolvedValueOnce(repositorySettings);

		const actual = await fetchSettings("", "");

		expect(actual).toBeUndefined();
		expect(mockError).toHaveBeenCalledWith(
			"Invalid item details:",
			itemDetails,
		);
	});

	it("returns the default branch and mapped item details when item details are valid", async () => {
		const defaultBranch = "some-branch";
		const itemDetails = { html_url: "https://github.com/user1/issues/1" };
		const repositorySettings = { default_branch: defaultBranch };

		mockFetchAsJson
			.mockResolvedValueOnce(itemDetails)
			.mockResolvedValueOnce(repositorySettings);

		const actual = await fetchSettings("", "");

		expect(actual).toEqual({
			defaultBranch,
			itemDetails: { htmlUrl: itemDetails.html_url },
		});
		expect(mockError).not.toHaveBeenCalled();
	});
});
