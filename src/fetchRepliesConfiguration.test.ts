import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchRepliesConfiguration } from "./fetchRepliesConfiguration.js";

const mockFetch = vi.fn();
const mockError = vi.fn();

describe("fetchRepliesConfiguration", () => {
	beforeEach(() => {
		globalThis.fetch = mockFetch;
		globalThis.console.error = mockError;
	});

	it("returns undefined and console errors when the fetch is not ok and status is not 404", async () => {
		const statusText = "Oh no!";

		mockFetch.mockResolvedValue({ ok: false, status: 500, statusText });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toBeUndefined();
		expect(mockError).toHaveBeenCalledWith(
			"Non-ok response fetching replies:",
			statusText,
		);
	});

	it("returns undefined and does not console error when the fetch is not ok and status is 404", async () => {
		mockFetch.mockResolvedValue({ ok: false, status: 404 });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toBeUndefined();
		expect(mockError).not.toHaveBeenCalled();
	});

	it("returns undefined and console errors when the fetch retrieves an invalid configuration", async () => {
		mockFetch.mockResolvedValue({ ok: true, text: () => "" });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toBeUndefined();
		expect(mockError).toHaveBeenCalledWith("Invalid saved replies:", undefined);
	});

	it("returns the configuration when fetch retrieves a valid configuration", async () => {
		const configuration = { replies: [] };
		mockFetch.mockResolvedValue({
			ok: true,
			text: () => JSON.stringify(configuration),
		});

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toEqual(configuration);
		expect(mockError).not.toHaveBeenCalled();
	});
});
