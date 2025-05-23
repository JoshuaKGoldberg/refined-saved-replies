# Development

After [forking the repo from GitHub](https://help.github.com/articles/fork-a-repo) and [installing pnpm](https://pnpm.io/installation):

```shell
git clone https://github.com/(your-name-here)/refined-saved-replies
cd refined-saved-replies
pnpm install
```

> This repository includes a list of suggested VS Code extensions.
> It's a good idea to use [VS Code](https://code.visualstudio.com) and accept its suggestion to install them, as they'll help with development.

## Building

Run [ESBuild](https://esbuild.github.io) locally to build source files:

```shell
pnpm dev
```

Add `--watch` to run the builder in a watch mode that continuously re-builds as you save files:

```shell
pnpm dev --watch
```

### Local Development with Chrome

Follow Google Chrome's _[Load an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)_ guide to load this repository's directory as an extension locally.

> ♻️ Remember to reload the extension in `chrome://extensions` whenever you make changes locally!

### Local Development with Firefox

Follow Firefox's _[Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)_ guide to load this repository's directory as an extension locally.

You'll then need to authorize the extension to run on <https://github.com>:

1. Find and select the _Extensions_ icon in the top right of Firefox
2. Select the _"Manage Extension"_ gear icon next to _Refined Saved Replies_
3. Select the _"Always Allow on github.com"_ option

> ♻️ Remember to reload the extension in `about:debugging#/runtime/this-firefox` whenever you make changes locally!

### Production Builds

Run [`web-ext`](https://extensionworkshop.com) to build a production-ready `.zip` under `./web-ext-artifacts/`:

```shell
pnpm build
```

Then upload that `./web-ext-artifacts/refined_saved_replies-*.zip` file to:

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/addon/submit/distribution)

## Formatting

[Prettier](https://prettier.io) is used to format code.
It should be applied automatically when you save files in VS Code or make a Git commit.

To manually reformat all files, you can run:

```shell
pnpm format --write
```

## Linting

This package includes several forms of linting to enforce consistent code quality and styling.
Each should be shown in VS Code, and can be run manually on the command-line:

- `pnpm lint` ([ESLint](https://eslint.org) with [typescript-eslint](https://typescript-eslint.io)): Lints JavaScript and TypeScript source files
- `pnpm lint:knip` ([knip](https://github.com/webpro/knip)): Detects unused files, dependencies, and code exports
- `pnpm lint:md` ([Markdownlint](https://github.com/DavidAnson/markdownlint)): Checks Markdown source files
- `pnpm lint:packages` ([pnpm dedupe --check](https://pnpm.io/cli/dedupe)): Checks for unnecessarily duplicated packages in the `pnpm-lock.yml` file
- `pnpm lint:spelling` ([cspell](https://cspell.org)): Spell checks across all source files
- `pnpm lint:web-ext` ([web-ext](https://extensionworkshop.com)): Lints browser extension metadata after `pnpm dev` creates local files

Read the individual documentation for each linter to understand how it can be configured and used best.

For example, ESLint can be run with `--fix` to auto-fix some lint rule complaints:

```shell
pnpm run lint --fix
```

## Testing

[Vitest](https://vitest.dev) is used for tests.
You can run it locally on the command-line:

```shell
pnpm run test
```

Add the `--coverage` flag to compute test coverage and place reports in the `coverage/` directory:

```shell
pnpm run test --coverage
```

Note that [console-fail-test](https://github.com/JoshuaKGoldberg/console-fail-test) is enabled for all test runs.
Calls to `console.log`, `console.warn`, and other console methods will cause a test to fail.

### Debugging Tests

This repository includes a [VS Code launch configuration](https://code.visualstudio.com/docs/editor/debugging) for debugging unit tests.
To launch it, open a test file, then run _Debug Current Test File_ from the VS Code Debug panel (or press F5).

## Type Checking

You should be able to see suggestions from [TypeScript](https://typescriptlang.org) in your editor for all open files.

However, it can be useful to run the TypeScript command-line (`tsc`) to type check all files in `src/`:

```shell
pnpm tsc
```

Add `--watch` to keep the type checker running in a watch mode that updates the display as you save files:

```shell
pnpm tsc --watch
```
