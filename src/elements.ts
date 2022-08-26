export type CreateElementAttributes = Record<string, unknown> & {
	className?: string;
	children?: (string | Node)[];
};

export function createElement<TagName extends keyof HTMLElementTagNameMap>(
	tagName: TagName,
	{ children, className, ...attributes }: CreateElementAttributes = {}
): HTMLElementTagNameMap[TagName] {
	const element = document.createElement(tagName);

	if (children) {
		element.append(...children);
	}

	if (className) {
		element.className = className;
	}

	for (const [key, value] of Object.entries(attributes)) {
		if (value) {
			element.setAttribute(key, value as string);
		}
	}

	return element;
}
