export function createElement<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  attributes: Record<string, any> = {}
): HTMLElementTagNameMap[TagName] {
  const element = document.createElement(tagName);

  for (const [key, value] of Object.entries(attributes)) {
    switch (key) {
      case "children":
        element.append(...value);
        break;
      case "className":
        element.className = value;
        break;
      default:
        element.setAttribute(key, value);
    }
  }

  return element;
}
