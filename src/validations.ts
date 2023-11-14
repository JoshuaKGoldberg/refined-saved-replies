import { BodyWithReplies, Reply, RepositorySettings } from "./types.js";

export function isBodyWithReplies(data: unknown): data is BodyWithReplies {
	return !!(
		data &&
		typeof data === "object" &&
		(data as Partial<BodyWithReplies>).replies instanceof Array &&
		(data as BodyWithReplies).replies.every(isReply)
	);
}

function isReply(data: unknown): data is Reply {
	return !!(
		data &&
		typeof data === "object" &&
		typeof (data as Partial<Reply>).body === "string" &&
		typeof (data as Partial<Reply>).name === "string"
	);
}

export function isRepositorySettings(
	data: unknown,
): data is RepositorySettings {
	return !!(
		data &&
		typeof data === "object" &&
		typeof (data as Partial<RepositorySettings>).default_branch === "string"
	);
}
