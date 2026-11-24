// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockReleaseIt,
	blockTSDown,
	blockVitest,
	blockWebExt,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		blocks: {
			add: [blockWebExt],
			exclude: [blockReleaseIt, blockTSDown],
		},
		extensions: [
			blockESLint({
				extensions: [
					{
						files: ["**/*.{js,ts}"],
						rules: [
							{
								entries: {
									"n/no-unsupported-features/node-builtins": [
										"error",
										{ allowExperimental: true },
									],
								},
							},
						],
					},
					{
						files: ["**/{dependabot,replies}.yml"],
						rules: [
							{
								comment:
									"Dependabot and this extension's own replies file use .yml names",
								entries: { "yml/file-extension": "off" },
							},
						],
					},
					{
						files: ["package.json"],
						rules: [
							{
								comment: "This is a browser extension, not an npm package",
								entries: { "package-json/require-exports": "off" },
							},
						],
					},
				],
			}),
			blockVitest({
				environment: "happy-dom",
			}),
		],
	},
});
