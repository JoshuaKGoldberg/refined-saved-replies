export interface BodyWithReplies {
	replies: Reply[];
}

export interface ItemDetails {
	html_url: string;
}

export interface Reply {
	body: string;
	name: string;
}

export interface RepositorySettings {
	default_branch: string;
}
