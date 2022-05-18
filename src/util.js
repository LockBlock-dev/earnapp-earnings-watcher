const axios = require("axios").default;
const pkg = require("../package.json");
const { readFileSync, writeFileSync } = require("fs");

module.exports = {
    log: (msg, type) => {
        let symbol = " ";
        switch (type) {
            case "warn":
                symbol = "!";
                break;
            case "success":
                symbol = "+";
                break;
            case "info":
                symbol = "?";
                break;
        }
        console.log(`[ ${symbol} ] ${msg}`);
    },

    delay: async (ms) => {
        return await new Promise((resolve) => setTimeout(resolve, ms));
    },

    bytesToSize: (bytes) => {
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        if (bytes === 0 || isNaN(bytes)) return "0 B";
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        if (i === 0) return `${bytes} ${sizes[i]}`;
        return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
    },

    getOld: (file) => {
        return JSON.parse(readFileSync(`./data/${file}.json`, "utf8"));
    },

    getNew: async (client, type) => {
        switch (type) {
            case "devices":
                const devices = await client.devices();
                writeFileSync("./data/devices.json", JSON.stringify(devices, null, 1), "utf8");
                return devices;
            case "stats":
                const stats = await client.stats();
                writeFileSync("./data/stats.json", JSON.stringify(stats, null, 1), "utf8");
                return stats;
            case "referrals":
                const referrals = await client.referrals();
                writeFileSync("./data/referrals.json", JSON.stringify(referrals, null, 1), "utf8");
                return referrals;
            case "transactions":
                const transactions = await client.transactions();
                writeFileSync(
                    "./data/transactions.json",
                    JSON.stringify(transactions, null, 1),
                    "utf8"
                );
                return transactions;
        }
    },
    checkUpdate: async () => {
        const version = (
            await axios.get(
                "https://raw.githubusercontent.com/LockBlock-dev/earnapp-earnings-watcher/master/package.json"
            )
        ).data.version;

        if (version !== pkg.version) {
            return version;
        }

        return false;
    },
};
