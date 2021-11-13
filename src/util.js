const fs = require("fs");

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
        return JSON.parse(fs.readFileSync(`./data/${file}.json`, "utf8"));
    },

    getNew: async (client, type) => {
        switch (type) {
            case "devices":
                const devices = await client.devices();
                fs.writeFileSync("./data/devices.json", JSON.stringify(devices, null, 1), "utf8");
                return devices;
            case "stats":
                const stats = await client.stats();
                fs.writeFileSync("./data/stats.json", JSON.stringify(stats, null, 1), "utf8");
                return stats;
        }
    },
};
