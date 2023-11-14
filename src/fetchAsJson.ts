export async function fetchAsJson(...args: Parameters<typeof fetch>) {
	return (await (await fetch(...args)).json()) as unknown;
}
