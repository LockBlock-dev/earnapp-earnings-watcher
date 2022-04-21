module.exports = {
    discordWebhookURL: "WEBHOOK URL", //Discord WebHook URL

    authMethod: "google", //don't touch this one

    oauthRefreshToken: "COOKIE", //see https://github.com/LockBlock-dev/earnapp.js#how-to-login-with-cookies

    modes: ["total", "referrals", "transactions"], //you can put one mode or all of them
    //available modes are: ["total", "perDevice", "groupDevices", "referrals", "transactions"]
    //using perDevice and groupDevices with many devices is not possible as it may exceed the size limit of an Embed

    delay: 40, //delay before updating earnings
};
