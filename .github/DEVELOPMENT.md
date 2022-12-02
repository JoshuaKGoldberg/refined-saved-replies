# Development

After [forking the repository on GitHub](https://docs.github.com/en/get-started/quickstart/fork-a-repo), install required packages with [Yarn](https://yarnpkg.com):

```shell
git clone https://github.com/your-username/refined-saved-replies
cd refined-saved-replies
yarn
```

> Tip: Consider using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and running `nvm install` to sync the Node version used to develop on this repository.

## Building

You can then use `yarn build` to build locally with [ESBuild](https://esbuild.github.io).
Add `--watch` to have files continuously built as they're saved.

```shell
yarn build --watch
```

## Using Local Builds

Follow Google Chrome's _[Load an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)_ guide to load this repository's directory as an extension locally.

> ♻️ Remember to reload the extension in `chrome://extensions` whenever you make changes locally!

## Publishing

The `zip` command will create a `./refined-saved-replies.zip` file containing relevant `manifest.json`, `assets/`, and `lib/` contents.

```shell
yarn zip
```

Upload that file to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
