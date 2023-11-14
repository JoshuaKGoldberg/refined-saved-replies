import { describe, expect, test } from "vitest";

import { isBodyWithReplies, isRepositorySettings } from "./validations.js";

describe("isBodyWithReplies", () => {
	test.each([
		["", false],
		[[], false],
		[null, false],
		[undefined, false],
		[{}, false],
		[{ replies: null }, false],
		[{ replies: undefined }, false],
		[{ replies: [] }, true],
		[{ replies: [{}] }, false],
		[{ replies: [{ body: "" }] }, false],
		[{ replies: [{ name: "" }] }, false],
		[{ replies: [{ body: "", name: "" }] }, true],
	])("%s is %s", (input, expected) => {
		const actual = isBodyWithReplies(input);

		expect(actual).toBe(expected);
	});
});
describe("isRepositoryDetails", () => {
	test.each([
		["", false],
		[[], false],
		[null, false],
		[undefined, false],
		[{}, false],
		[{ default_branch: null }, false],
		[{ default_branch: undefined }, false],
		[{ default_branch: "" }, true],
	])("%s is %s", (input, expected) => {
		const actual = isRepositorySettings(input);

		expect(actual).toBe(expected);
	});
});
