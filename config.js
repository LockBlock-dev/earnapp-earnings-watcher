module.exports = {
    discordWebhookURL: "WEBHOOK URL", //Discord WebHook URL

    authMethod: "google", //don't touch this one

    oauthRefreshToken: "COOKIE", //see https://github.com/LockBlock-dev/earnapp.js#how-to-login-with-cookies

    modes: ["total", "perDevice", "groupDevices", "referrals", "transactions"], //you can put one mode or all of them

    delay: 40, //delay before updating earnings
};
