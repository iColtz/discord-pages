const { token } = require("./config.js");
const { Client, MessageEmbed } = require("discord.js");
const EmbedPages = require("../src/index.js");
const client = new Client();

client.once("ready", () => console.log("Yoo this is ready!"));

client.on("message", async (message) => {
    if (message.content.startsWith("?test")) {
        const embed1 = new MessageEmbed().setColor("RED").setDescription("Test Number 1");
        const embed2 = new MessageEmbed().setColor("BLUE").setDescription("Test Number 2");
        const embed3 = new MessageEmbed().setColor("YELLOW").setDescription("Test Number 3");
        const pages = [embed1, embed2, embed3];
        const embedPages = new EmbedPages({ pages: pages, channel: message.channel });
        embedPages.createPages();
    }
});

client.login(token);