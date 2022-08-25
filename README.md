# Refined Saved Replies

A Chrome extension for GitHub's [Saved Replies](https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/using-saved-replies) that adds replies from a repository's `.github/replies.yml`.

## TODOs

- Error handling/logging
- Investigate accessibility (how+why does GitHub use `role="none"`?)
- Shortcuts
- Integration with the web components
- Short (one second) cache for fetching replies.yml files
- Use an API that doesn't cause an angry 404 in the dev tools when not found
- Use an observer on saved replies button click, not a quick setTimeout loop

## Development
