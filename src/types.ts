export interface BodyWithReplies {
	replies: Reply[];
}

export interface ItemDetails {
	[key: string]: unknown;
	html_url: string;
}

export interface Reply {
	body: string;
	name: string;
}

export interface RepositorySettings {
	default_branch: string;
}
