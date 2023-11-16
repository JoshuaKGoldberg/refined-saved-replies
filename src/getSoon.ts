export async function getSoon<Value extends Node | Node[] | NodeList | null>(
	getter: () => Value,
) {
	for (let i = 0; i < 100; i += 1) {
		const result = getter();
		if (result && (!(result instanceof NodeList) || result.length)) {
			return result;
		}

		await new Promise((resolve) => setTimeout(resolve, i));
	}

	// TODO: Add handling for a rejection
	// https://github.com/JoshuaKGoldberg/refined-saved-replies/issues/2
	throw new Error(`Element was never found 😔`);
}
