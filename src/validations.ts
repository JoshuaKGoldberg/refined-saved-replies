import { BodyWithReplies, Reply } from "./types";

export function isBodyWithReplies(data: unknown): data is BodyWithReplies {
  return !!(
    typeof data === "object" &&
    data &&
    "replies" in data &&
    (data as Partial<BodyWithReplies>).replies instanceof Array &&
    (data as BodyWithReplies).replies.every(isReply)
  );
}

function isReply(data: unknown): data is Reply {
  return !!(
    typeof data === "object" &&
    data &&
    "body" in data &&
    typeof (data as Partial<Reply>).body === "string" &&
    "name" in data &&
    typeof (data as Partial<Reply>).name === "string"
  );
}
