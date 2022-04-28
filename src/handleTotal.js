const { log, getOld, getNew, bytesToSize } = require("./util.js");

module.exports = async (client, postman) => {
    const embed = {
        title: "EarnApp gains report",
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
    let active = newEarnings.filter((device) => device.earned > 0);
    let oldTraffic = 0;
    let newTraffic = 0;
    let activesCount = {
        win: 0,
        linux: 0,
        android: 0
    }
    let count = {
        win: 0,
        linux: 0,
        android: 0
    }

    oldEarnings.filter((device) => device.earned > 0).forEach((device) => (oldTraffic += device.bw));
    active.forEach((device) => {
        newTraffic += device.bw;
        if (device.uuid.includes("win")) activesCount.win += 1;
        if (device.uuid.includes("node")) activesCount.linux += 1;
        if (device.uuid.includes("android")) activesCount.android += 1;
    });
    newEarnings.forEach((device) => {
        if (device.uuid.includes("win")) count.win += 1;
        if (device.uuid.includes("node")) count.linux += 1;
        if (device.uuid.includes("android")) count.android += 1;
    });

    const bottom = () => {
        if (newStats.redeem_details) {
            embed.fields.push({
                name: "Payment method",
                value: newStats.redeem_details.payment_method,
            });
        }

        embed.fields.push(
            {
                name: "Active devices",
                value: `${active.length} devices | ${activesCount.win} windows | ${activesCount.linux} linux | ${activesCount.android} android`,
            },
            {
                name: "Total devices",
                value: `${newEarnings.length} devices | ${count.win} windows | ${count.linux} linux | ${count.android} android`,
            }
        );
    };

    if (difference > 0) {
        embed.color = 0x00bb6e;
        embed.description = "Balance update";
        embed.fields.push(
            {
                name: "Earned",
                value: `+ ${difference.toFixed(2)}$`,
                inline: true,
            },
            {
                name: "Referrals bonus",
                value: `+ ${(newStats.ref_bonuses - oldStats.ref_bonuses).toFixed(2)}$`,
                inline: true,
            },
            {
                name: "Promotions bonus",
                value: `+ ${(newStats.promo_bonuses - oldStats.promo_bonuses).toFixed(2)}$`,
                inline: true,
            },
            {
                name: "Traffic",
                value: `+ ${bytesToSize((newTraffic - oldTraffic).toFixed(1))}`,
                inline: true,
            },
            {
                name: "Balance",
                value: `${newStats.balance}$`,
                inline: true,
            },
            {
                name: "Lifetime balance",
                value: `${newStats.earnings_total}$`,
                inline: true,
            }
        );
        bottom();
    } else if (difference === 0) {
        embed.color = 0xff0101;
        embed.description = "Balance didn't change";
        embed.fields.push(
            {
                name: "Earned",
                value: `+ ${difference}$`,
                inline: true,
            },
            {
                name: "Referrals bonus",
                value: `+ ${(newStats.ref_bonuses - oldStats.ref_bonuses).toFixed(2)}$`,
                inline: true,
            },
            {
                name: "Promotions bonus",
                value: `+ ${(newStats.promo_bonuses - oldStats.promo_bonuses).toFixed(2)}$`,
                inline: true,
            },
            {
                name: "Traffic",
                value: `+ ${bytesToSize(newTraffic - oldTraffic)}`,
                inline: true,
            },
            {
                name: "Balance",
                value: `${newStats.balance}$`,
                inline: true,
            },
            {
                name: "Lifetime balance",
                value: `${newStats.earnings_total}$`,
                inline: true,
            }
        );
        bottom();
    }

    log("Total report sent", "success");
    postman.send(null, [embed]);
};
