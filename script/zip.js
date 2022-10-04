import { Zip } from "zip-lib";

import manifest from "../manifest.json" assert { type: "json" };

const zip = new Zip();

zip.addFolder("./lib", "./lib");
zip.addFile("./manifest.json");

for (const icon of Object.values(manifest.icons)) {
	zip.addFile(icon, icon);
}

await zip.archive("./refined-saved-replies.zip");
