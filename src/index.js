const fs = require("fs");
const axios = require("axios").default;
const { Client } = require("earnapp.js");
const { Webhook } = require("simple-discord-webhooks");
const { log, delay, getOld } = require("./util.js");
const handleTotal = require("./handleTotal.js");
const handlePerDevice = require("./handlePerDevice.js");
const handleTransactions = require("./handleTransactions.js");
const config = require("../config.js");
const pkg = require("../package.json");

if (process.env.WEBHOOK_URL) config.discordWebhookURL = process.env.WEBHOOK_URL;
if (process.env.AUTH) config.oauthRefreshToken = process.env.AUTH;
if (process.env.MODE) {
    let options = ["total", "perDevice", "transactions", "all"];
    if (options.includes(process.env.MODE)) config.modes = [process.env.MODE];
}

const client = new Client();
const postman = new Webhook(config.discordWebhookURL);
const webhookReg = /https:\/\/discord.com\/api\/webhooks\/\d{18}\/.+/;

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
    const version = (await axios.get("https://raw.githubusercontent.com/LockBlock-dev/earnapp-earnings-watcher/master/package.json")).data.version;

    if (version !== pkg.version) log(`An update is available! v${pkg.version} => v${version}`, "info");
};

const run = async () => {
    log(`Welcome to EarnApp Earnings Watcher v${pkg.version}`, "success");

    let test = await init();

    if (!test) process.exit(1);
    if (!fs.existsSync("./data/")) fs.mkdirSync("./data");
    if (!fs.existsSync("./data/devices.json") || !fs.existsSync("./data/stats.json") || !fs.existsSync("./data/transactions.json")) {
        fs.writeFileSync("./data/devices.json", "{}");
        fs.writeFileSync("./data/stats.json", "{}");
        fs.writeFileSync("./data/transactions.json", "{}");
    }
    if (Object.entries(getOld("devices")).length === 0 || Object.entries(getOld("stats")).length === 0) {
        log("No previous data detected, downloading...", "info");

        const devices = await client.devices();
        fs.writeFileSync("./data/devices.json", JSON.stringify(devices, null, 1), "utf8");
        const stats = await client.stats();
        fs.writeFileSync("./data/stats.json", JSON.stringify(stats, null, 1), "utf8");
        const transactions = await client.transactions();
        fs.writeFileSync("./data/transactions.json", JSON.stringify(transactions, null, 1), "utf8");

        log("Previous data downloaded", "success");
    }

    await checkUpdate();

    log("Waiting for a balance update...", "info");

    let time = new Date();
    while (test) {
        let newTime = new Date();
        if (time.getUTCHours() - newTime.getUTCHours() < 0) {
            time = newTime;
            await delay(1000 * 40);

            config.modes.forEach((m) => {
                switch (m) {
                    case "total":
                        handleTotal(client, postman);
                        break;
                    case "perDevice":
                        handlePerDevice(client, postman);
                        break;
                    case "transactions":
                        handleTransactions(client, postman);
                        break;
                }
            });
        }
        await delay(1000 * 60);
    }
};

run();
