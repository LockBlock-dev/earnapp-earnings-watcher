module.exports = {
    discordWebhookURL: "WEBHOOK URL", //Discord WebHook URL

    authMethod: "google", //don't touch this one

    oauthRefreshToken: "COOKIE", //see https://github.com/LockBlock-dev/earnapp.js#how-to-login-with-cookies

    modes: ["total", "perDevice"], //you can put one mode or both

    get_from_env: function () {
        if (process.env.WEBHOOK_URL != undefined) {
            this.discordWebhookURL = process.env.WEBHOOK_URL;
        }
        if (process.env.AUTH != undefined) {
            this.oauthRefreshToken = process.env.AUTH;
        }
        if (process.env.MODE != undefined) {
            let options = ["total", "perDevice", "both"]
            if (options.includes(process.env.MODE)) {
                this.modes = [process.env.MODE];
            }
        }
    }
};