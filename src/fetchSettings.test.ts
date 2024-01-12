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
		globalThis.console.error = mockError;
	});

	it("returns undefined and console errors when the repository settings are invalid", async () => {
		const repositorySettings = { invalid: true };

		mockFetchAsJson
			.mockResolvedValueOnce({})
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
		const itemDetails = { item: "details" };
		const repositorySettings = { default_branch: defaultBranch };

		mockFetchAsJson
			.mockResolvedValueOnce(itemDetails)
			.mockResolvedValueOnce(repositorySettings);

		const actual = await fetchSettings("", "");

		expect(actual).toEqual({ defaultBranch, itemDetails });
		expect(mockError).not.toHaveBeenCalled();
	});
});
