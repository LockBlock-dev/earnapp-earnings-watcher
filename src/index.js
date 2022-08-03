const { existsSync, mkdirSync, writeFileSync } = require("fs");
const { Client } = require("earnapp.js");
const { Webhook } = require("simple-discord-webhooks");
const { log, delay, getOld } = require("./util.js");
const { update } = require("./update.js");
const config = require("../config.js");
const pkg = require("../package.json");

const client = new Client();
const postman = new Webhook(config.discordWebhookURL);
const webhookReg = /https:\/\/discord.com\/api\/webhooks\/\d{18,}\/.+/;
const files = ["devices", "referrals", "stats", "transactions"];

client.dashboard.login({
    authMethod: config.authMethod,
    oauthRefreshToken: config.oauthRefreshToken,
});

const init = async () => {
    try {
        await client.dashboard.userData();
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

run = async () => {
    log(`Welcome to EarnApp Earnings Watcher v${pkg.version}`, "success");

    await update();

    let test = await init();

    if (!test) process.exit(1);
    if (!existsSync("./data/")) mkdirSync("./data");

    files.forEach(async (f) => {
        if (!existsSync(`./data/${f}.json`)) writeFileSync(`./data/${f}.json`, "{}");

        if (Object.entries(getOld(f)).length === 0) {
            log(`No previous ${f} detected, downloading...`, "info");
            let data;

            switch (f) {
                case "devices":
                    data = await client.dashboard.devices();
                    break;
                case "stats":
                    data = await client.dashboard.stats();
                    break;
                case "referrals":
                    data = await client.dashboard.referrals();
                    break;
                case "transactions":
                    data = await client.dashboard.transactions();
                    break;
            }

            writeFileSync(`./data/${f}.json`, JSON.stringify(data, null, 1), "utf8");
            log(`Previous ${f} downloaded`, "success");
        }
    });

    log("Waiting for a balance update...", "info");

    while (test) {
        let counters = await client.dashboard.counters();

        await delay(counters.balance_sync);
        await delay(1000 * config.delay);

        config.modes.forEach((m) => {
            switch (m) {
                case "total":
                    try {
                        require("./handleTotal.js")(client, postman);
                    } catch {}

                    break;
                case "perDevice":
                    try {
                        require("./handlePerDevice.js")(client, postman);
                    } catch {}

                    break;
                case "groupDevices":
                    try {
                        require("./handleGroupDevices.js")(client, postman);
                    } catch {}

                    break;
                case "referrals":
                    try {
                        require("./handleReferrals.js")(client, postman);
                    } catch {}

                    break;
                case "transactions":
                    try {
                        require("./handleTransactions.js")(client, postman);
                    } catch {}

                    break;
            }
        });

        await update();
    }
};

run();
