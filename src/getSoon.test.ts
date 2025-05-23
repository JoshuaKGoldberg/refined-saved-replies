import { describe, expect, it } from "vitest";

import { getSoon } from "./getSoon.js";

describe("getSoon", () => {
	it("resolves when the getter returns a Node", async () => {
		const node = document.createElement("div");

		const result = await getSoon(() => node);

		expect(result).toBe(node);
	});

	it("resolves when the getter returns a non-empty NodeList", async () => {
		const div = document.createElement("div");
		div.appendChild(document.createElement("div"));

		const result = await getSoon(() => div);

		expect(result).toBe(div);
	});
});
