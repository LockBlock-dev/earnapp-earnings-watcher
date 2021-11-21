const { log, getOld, getNew, bytesToSize } = require("./util.js");

module.exports = async (client, postman) => {
    const embed = {
        title: "EarnApp gains report",
        color: 0x00bb6e,
        description: "Referrals report",
        thumbnail: {
            url: "https://earnapp.com/wp-content/uploads/2020/09/favicon-1.png",
        },
        fields: [],
        footer: {
            text: "EarnApp Earnings Watcher © LockBlock-dev",
        },
    };

    const oldReferrals = getOld("referrals");
    const newReferrals = await getNew(client, "referrals");

    if (newReferrals.length - oldReferrals.length > 0) {
        newReferrals.forEach((referral, i) => {
            embed.fields.push({
                name: referral.email,
                value: `
                    Earned: + ${referral.bonuses - (oldReferrals[i]?.bonuses ?? 0)}$
                    Lifetime bonus: ${referral.bonuses_total}$
                    `,
            });
        });

        log("Referrals report sent", "success");
        postman.send(null, [embed]);
    }
};
