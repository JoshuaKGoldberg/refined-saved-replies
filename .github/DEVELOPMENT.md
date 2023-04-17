# Development

After [forking the repository on GitHub](https://docs.github.com/en/get-started/quickstart/fork-a-repo), install required packages with [Yarn](https://yarnpkg.com):

```shell
git clone https://github.com/your-username/refined-saved-replies
cd refined-saved-replies
yarn
```

> Tip: Consider using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and running `nvm install` to sync the Node version used to develop on this repository.

## Linting

To lint the codebase, run `yarn run webext:lint`. This uses the [addons linter](https://github.com/mozilla/addons-linter) to check for common errors. For available options, see the [addons linter documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-lint).

## Building

You can then use `yarn build` to build locally with [ESBuild](https://esbuild.github.io).
Add `--watch` to have files continuously built as they're saved.

```shell
yarn build --watch
```

## Using Local Builds

### Chrome (Chromium)

Follow Google Chrome's _[Load an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)_ guide to load this repository's directory as an extension locally.

> ♻️ Remember to reload the extension in `chrome://extensions` whenever you make changes locally!

### Firefox

This reposiory uses [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) to build and run the extension locally. While developing run `yarn run firefox:dev` to build and run the extension in a new Firefox instance. This will automatically reload the extension when you make changes.

> NOTE: You need Firefox version 109 or later to run the extension.

## Publishing

### Chrome Web Store

The `zip` command will create a `./refined-saved-replies.zip` file containing relevant `manifest.json`, `assets/`, and `lib/` contents.

```shell
yarn zip
```

Upload that file to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### Firefox Add-ons

Run `yarn run firefox:package` which will [package the extension](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/#packaging-your-extension) as a `.zip` file in `web-ext-artifacts`.

Upload the `.zip` file to the [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/addon/submit/distribution).
