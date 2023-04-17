# Refined Saved Replies

[![GitHub CI](https://github.com/JoshuaKGoldberg/sinon-timers-repeatable/actions/workflows/compile.yml/badge.svg)](https://github.com/JoshuaKGoldberg/sinon-timers-repeatable/actions/workflows/compile.yml)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)
![TypeScript: Strict](https://img.shields.io/badge/typescript-strict-brightgreen.svg)

A Browser extension for GitHub's [Saved Replies](https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/using-saved-replies) that adds replies from a repository's `.github/replies.yml`.

Saved Replies are great, but oftentimes repository maintainers need a way to share common replies per-repository.
This extension modifies the Saved Replies for issues or pull requests on any repository with a `.github/replies.yml` file to include those replies.

## Usage

Get it on [Chrome Web Store > Refined Saved Replies](https://chrome.google.com/webstore/detail/refined-saved-replies/ngcinicnlicdndmpcfjjifononfcceih)! ✨

Install it from the [Firefox Add-ons > Refined Saved Replies](#TBD) page! 🦊

After installing the extension in Firefox, you'll need to authorize the extension to run on [https://github.com](https://github.com).

### Firefox Configuration

Find and select the Firefox add-ons icon in the top right of your browser.

![A puzzle piece icon with a small green dot underneath.](docs-assets/firefox-addons-icon.png)

Select the "Manage Your Extensions" button.

![Shows the addon entry name with a gear icon to the right.](docs-assets/firefox-addons-settings.png)

Select the "Always Allow on github.com" option, and you are ready to go.

![Shows the expanded addon settings with the Always Allow on github.com option highlighted.](docs-assets/firefox-addons-allow-github.png)

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 💖
