import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchRepliesConfiguration } from "./fetchRepliesConfiguration.js";

const mockFetch = vi.fn();
const mockError = vi.fn();

describe("fetchRepliesConfiguration", () => {
	beforeEach(() => {
		globalThis.fetch = mockFetch;
		globalThis.console.error = mockError;
	});

	it("returns an error result and console errors when the fetch is not ok and status is not 404", async () => {
		const statusText = "Oh no!";

		mockFetch.mockResolvedValue({ ok: false, status: 500, statusText });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toEqual({ message: statusText, type: "error" });
		expect(mockError).toHaveBeenCalledWith(
			"Non-ok response fetching replies:",
			statusText,
		);
	});

	it("returns a notFound result and does not console error when the fetch is not ok and status is 404", async () => {
		mockFetch.mockResolvedValue({ ok: false, status: 404 });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toEqual({ type: "notFound" });
		expect(mockError).not.toHaveBeenCalled();
	});

	it("returns an error result and console errors when the fetch retrieves an invalid configuration", async () => {
		mockFetch.mockResolvedValue({ ok: true, text: () => "" });

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toEqual({
			message: "Invalid saved replies configuration.",
			type: "error",
		});
		expect(mockError).toHaveBeenCalledWith("Invalid saved replies:", undefined);
	});

	it("returns a success result when fetch retrieves a valid configuration", async () => {
		const configuration = { replies: [] };
		mockFetch.mockResolvedValue({
			ok: true,
			text: () => JSON.stringify(configuration),
		});

		const actual = await fetchRepliesConfiguration("", "");

		expect(actual).toEqual({ configuration, type: "success" });
		expect(mockError).not.toHaveBeenCalled();
	});
});
