const axios = require("axios").default;
let pkg = require("../package.json");
const { readdirSync, writeFileSync } = require("fs");
const { log, checkUpdate } = require("./util.js");
const { execSync } = require("child_process");
const config = require("../config.js");

module.exports.update = async () => {
    const update = await checkUpdate();
    const autoUpdate = config.autoUpdate;

    if (update && autoUpdate !== false) {
        log(`An update is available! v${pkg.version} => v${update}`, "info");
        log("Updating...", "info");

        let files;

        try {
            files = (
                await axios.get(
                    "https://api.github.com/repos/LockBlock-dev/earnapp-earnings-watcher/contents/src"
                )
            ).data;

            files = files.map((f) => `src/${f.name}`);
        } catch {
            files = readdirSync("./src").filter((files) => files.endsWith(".js"));
        }

        files.push("package.json");

        if (files) {
            for (let i = 0; i < files.length; i++) {
                const code = (
                    await axios.get(
                        `https://raw.githubusercontent.com/LockBlock-dev/earnapp-earnings-watcher/master/${files[i]}`
                    )
                ).data;

                writeFileSync(
                    `./${files[i]}`,
                    typeof code === "object" ? JSON.stringify(code, null, 2) : code,
                    "utf8"
                );
            }

            pkg = require("../package.json");
            const deps = Object.entries(pkg.dependencies).map(
                (p) => `${p[0]}${p[1].replace("^", "@")}`
            );

            execSync(`npm install ${deps.join(" ")}`, { stdio: [0, 1, 2] });

            log(`Updated to v${update}!`, "success");
        } else {
            log(`Failed to update!`, "warn");
        }
    } else {
        if (autoUpdate === false) log(`Skipping auto update, disabled in config`, "info");
        else log(`Skipping auto update, you have the last version`, "info");
    }
};
