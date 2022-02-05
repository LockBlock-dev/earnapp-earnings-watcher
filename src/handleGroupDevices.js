const { log, getOld, getNew, bytesToSize } = require("./util.js");

module.exports = async (client, postman) => {
    const embed = {
        title: "EarnApp gains report",
        color: 0x00bb6e,
        description: "Group devices report",
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

    const old_group = {};
    const new_group = {};

    oldEarnings.forEach((device) => {
        if (!old_group[device.title]) old_group[device.title] = device;
        else
            old_group[device.title] = {
                bw: old_group[device.title].device + device.bw,
                total_bw: old_group[device.title].total_bw + device.total_bw,
                redeem_bw: old_group[device.title].redeem_bw + device.redeem_bw,
                earned: old_group[device.title].earned + device.earned,
                earned_total: old_group[device.title].earned_total + device.earned_total,
            };
    });

    newEarnings.forEach((device) => {
        if (!new_group[device.title]) new_group[device.title] = device;
        else
            new_group[device.title] = {
                bw: new_group[device.title].device + device.bw,
                total_bw: new_group[device.title].total_bw + device.total_bw,
                rate: device.rate,
                redeem_bw: new_group[device.title].redeem_bw + device.redeem_bw,
                earned: new_group[device.title].earned + device.earned,
                earned_total: new_group[device.title].earned_total + device.earned_total,
            };
    });

    let difference = newStats.balance - oldStats.balance + 100;
    let i = 0;

    if (difference > 0) {
        for (let device in new_group) {
            if (new_group[device].earned > 0) {
                embed.fields.push({
                    name: device,
                    value: `
                    Earned: + ${(new_group[device].earned - (old_group[device].earned ?? 0)).toFixed(2)}$
                    Traffic: + ${bytesToSize(new_group[device].bw - (old_group[device]?.bw ?? 0))}
                    Rate: ${new_group[device].rate}
                    Lifetime balance: ${new_group[device].earned_total}$
                    Lifetime traffic: ${bytesToSize(new_group[device].total_bw)}
                    `,
                });
            }
            i += 1;
        }

        log("Group device report sent", "success");
        postman.send(null, [embed]);
    }
};
