const { log, getOld, getNew, bytesToSize } = require("./util.js");

module.exports = async (client, postman) => {
    const report = (transaction) => {
        let embed = {
            title: "EarnApp gains report",
            description: "New transaction",
            thumbnail: {
                url: "https://earnapp.com/wp-content/uploads/2020/09/favicon-1.png",
            },
            fields: [],
            footer: {
                text: "EarnApp Earnings Watcher © LockBlock-dev",
            },
        };

        embed.fields.push(
            {
                name: "Amount",
                value: `${transaction.money_amount}$`,
                inline: true,
            },
            {
                name: "Referrals bonus",
                value: `${transaction.ref_bonuses_amount}$`,
                inline: true,
            },
            {
                name: "Promotions bonus",
                value: `${transaction.promo_bonuses_amount}$`,
                inline: true,
            },
            {
                name: "Traffic",
                value: bytesToSize(transaction.bw_amount),
                inline: true,
            },
            {
                name: "Status",
                value: transaction.status.split("_")[0],
                inline: true,
            },
            {
                name: "UUID",
                value: transaction.uuid,
            },
            {
                name: "Creation date",
                value: new Date(transaction.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            }
        );

        if (transaction.status === "paid") {
            embed.fields.push({
                name: "Payment date",
                value: new Date(transaction.payment_date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            });

            embed.color = 0x00bb6e;
        } else {
            embed.color = 0xff7702;
        }

        embed.fields.push(
            {
                name: "Payment email",
                value: transaction.email,
            },
            {
                name: "Payment method",
                value: transaction.payment_method,
            }
        );

        return embed;
    };

    const oldTransactions = getOld("transactions");
    const newTransactions = await getNew(client, "transactions");

    let difference = newTransactions.length - oldTransactions.length;

    if (difference > 0) {
        newTransactions.forEach((transaction, i) => {
            if (oldTransactions[i - difference]?.uuid !== transaction.uuid) {
                log("Transaction report sent", "success");
                postman.send(null, [report(transaction)]);
            }
        });
    } else if (difference === 0) {
        newTransactions.forEach((transaction, i) => {
            if (oldTransactions[i]?.status !== transaction.status) {
                log("Transaction report sent", "success");
                postman.send(null, [report(transaction)]);
            }
        });
    }
};
