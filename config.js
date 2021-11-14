module.exports = {
    discordWebhookURL: "WEBHOOK URL", //Discord WebHook URL

    authMethod: "google", //don't touch this one

    oauthRefreshToken: "COOKIE", //see https://github.com/LockBlock-dev/earnapp.js#how-to-login-with-cookies

    modes: ["total", "perDevice", "transactions"], //you can put one mode or all of them

    get_from_env: () => {
        if (process.env.WEBHOOK_URL) {
            this.discordWebhookURL = process.env.WEBHOOK_URL;
        }
        if (process.env.AUTH) {
            this.oauthRefreshToken = process.env.AUTH;
        }
        if (process.env.MODE) {
            let options = ["total", "perDevice", "transactions", "all"];
            if (options.includes(process.env.MODE)) {
                this.modes = [process.env.MODE];
            }
        }
    }
};