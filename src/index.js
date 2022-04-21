const fs = require("fs");
const axios = require("axios").default;
const { Client } = require("earnapp.js");
const { Webhook } = require("simple-discord-webhooks");
const { log, delay, getOld } = require("./util.js");
const handleTotal = require("./handleTotal.js");
const handlePerDevice = require("./handlePerDevice.js");
const handleGroupDevices = require("./handleGroupDevices.js");
const handleReferrals = require("./handleReferrals.js");
const handleTransactions = require("./handleTransactions.js");
const config = require("../config.js");
const pkg = require("../package.json");

if (process.env.WEBHOOK_URL) config.discordWebhookURL = process.env.WEBHOOK_URL;
if (process.env.AUTH) config.oauthRefreshToken = process.env.AUTH;
if (process.env.MODE) {
    let options = ["total", "perDevice", "groupDevice", "transactions", "all"];
    if (options.includes(process.env.MODE)) config.modes = [process.env.MODE];
}
if (process.env.DELAY) config.delay = process.env.DELAY;
const client = new Client();
const postman = new Webhook(config.discordWebhookURL);
const webhookReg = /https:\/\/discord.com\/api\/webhooks\/\d{18}\/.+/;
const files = ["devices", "referrals", "stats", "transactions"];

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

const checkUpdate = async () => {
    const version = (
        await axios.get(
            "https://raw.githubusercontent.com/LockBlock-dev/earnapp-earnings-watcher/master/package.json"
        )
    ).data.version;

    if (version !== pkg.version)
        log(`An update is available! v${pkg.version} => v${version}`, "info");
};

const run = async () => {
    log(`Welcome to EarnApp Earnings Watcher v${pkg.version}`, "success");

    let test = await init();

    if (!test) process.exit(1);
    if (!fs.existsSync("./data/")) fs.mkdirSync("./data");

    files.forEach(async (f) => {
        if (!fs.existsSync(`./data/${f}.json`)) fs.writeFileSync(`./data/${f}.json`, "{}");

        if (Object.entries(getOld(f)).length === 0) {
            log(`No previous ${f} detected, downloading...`, "info");
            let data;

            switch (f) {
                case "devices":
                    data = await client.devices();
                    break;
                case "stats":
                    data = await client.stats();
                    break;
                case "referrals":
                    data = await client.referrals();
                    break;
                case "transactions":
                    data = await client.transactions();
                    break;
            }

            fs.writeFileSync(`./data/${f}.json`, JSON.stringify(data, null, 1), "utf8");
            log(`Previous ${f} downloaded`, "success");
        }
    });

    log("Waiting for a balance update...", "info");

    await checkUpdate();

    while (test) {
        let counters = await client.counters();

        await delay(counters.balance_sync);
        await delay(1000 * config.delay);

        config.modes.forEach((m) => {
            switch (m) {
                case "total":
                    handleTotal(client, postman);
                    break;
                case "perDevice":
                    handlePerDevice(client, postman);
                    break;
                case "groupDevices":
                    handleGroupDevices(client, postman);
                    break;
                case "referrals":
                    handleReferrals(client, postman);
                    break;
                case "transactions":
                    handleTransactions(client, postman);
                    break;
            }
        });

        await checkUpdate();
    }
};

run();
