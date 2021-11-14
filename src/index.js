const fs = require("fs");
const { Client } = require("earnapp.js");
const { log, delay, getOld } = require("./util.js");
const handleTotal = require("./handleTotal.js");
const handlePerDevice = require("./handlePerDevice.js");
const config = require("../config.js");

const client = new Client();
const webhookReg = /https:\/\/discord.com\/api\/webhooks\/\d{18}\/.+/;

config.get_from_env()
client.login({
    authMethod: config.authMethod,
    oauthRefreshToken: config.oauthRefreshToken,
});

const init = async () => {
    try {
        await client.userData();
    } catch (e) {
        log("Couldn't log into EarnApp, check your cookie!", "warn");
        return false;
    }

    if (!webhookReg.test(config.discordWebhookURL)) {
        log("Discord Webhook URL is invalid!", "warn");
        return false;
    }

    return true;
};

const run = async () => {
    log(`Welcome to EarnApp Earnings Watcher v${require("../package.json").version}`, "success");
    let test = await init();
    if (!test) {
        process.exit(1);
    }
    if (!fs.existsSync("./data/")) fs.mkdirSync("./data");
    if (!fs.existsSync("./data/devices.json") || !fs.existsSync("./data/stats.json")) {
        fs.writeFileSync("./data/devices.json", "{}");
        fs.writeFileSync("./data/stats.json", "{}");
    }
    if (Object.entries(getOld("devices")).length === 0 || Object.entries(getOld("stats")).length === 0) {
        log("No previous data detected, downloading...", "info");
        const devices = await client.devices();
        fs.writeFileSync("./data/devices.json", JSON.stringify(devices, null, 1), "utf8");
        const stats = await client.stats();
        fs.writeFileSync("./data/stats.json", JSON.stringify(stats, null, 1), "utf8");
        log("Previous data downloaded", "success");
    }

    log("Waiting for a balance update...", "info");

    let time = new Date();
    while (test) {
        let newTime = new Date();
        if (time.getHours() - newTime.getHours() < 0) {
            time = newTime;
            await delay(1000 * 40);

            config.modes.forEach((m) => {
                switch (m) {
                    case "total":
                        handleTotal(client);
                        break;
                    case "perDevice":
                        handlePerDevice(client);
                        break;
                }
            });
        }
        await delay(1000 * 60);
    }
};

run();
