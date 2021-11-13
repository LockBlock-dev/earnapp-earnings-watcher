const { Webhook } = require("simple-discord-webhooks");
const { log, getOld, getNew, bytesToSize } = require("./util.js");
const config = require("../config.js");

const postman = new Webhook(config.discordWebhookURL);

module.exports = async (client) => {
    const embed = {
        title: "EarnApp gains report",
        color: 0x00bb6e,
        description: "Per device report",
        thumbnail: {
            url: "https://earnapp.com/wp-content/uploads/2020/09/favicon-1.png",
        },
        fields: [],
        footer: {
            text: "EarnApp Earnings Watcher © LockBlock-dev",
        },
    };

    const oldEarnings = getOld("devices");
    const oldStats = getOld("stats");
    const newEarnings = await getNew(client, "devices");
    const newStats = await getNew(client, "stats");

    let difference = newStats.balance - oldStats.balance;

    if (difference > 0) {
        newEarnings.forEach((device, i) => {
            if (device.earned > 0) {
                embed.fields.push({
                    name: device.uuid,
                    value: `
                    Earned: + ${(device.earned - oldEarnings[i]?.earned ?? 0).toFixed(2)}$
                    Traffic: + ${bytesToSize(device.bw - oldEarnings[i]?.bw ?? 0)}
                    Rate: ${device.rate}
                    Lifetime balance: ${device.total_earned}$
                    Lifetime traffic: ${bytesToSize(device.total_bw)}
                    Country: :flag_${device.cn}:
                    `,
                });
            }
        });

        log(`Per device report sent`, "success");
        postman.send(null, [embed]);
    }
};
