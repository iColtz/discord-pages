const { Message, MessageEmbed } = require("discord.js");

class DiscordEmbedPages {
    constructor(pages, message) {
        this.pages = pages instanceof Array ? pages : [];

        this.message = (message instanceof Message) ? message : null;

        this.pages.forEach(embed => {
            if (!(embed instanceof MessageEmbed)) throw new Error("An element in the pages array is not a discord message embed.");
        });

        this.createPages(this.pages, this.message);
    }

    async createPages(pages, message) {
        try {
            var msg = await message.channel.send({ embed: pages[0] });
            await msg.react("◀️");
            await msg.react("▶️");
        } catch (error) { return console.warn(error); }
        let i = 0;
        const filter = (reaction, user) => user.id === message.author.id;
        const collector = msg.createReactionCollector(filter, { time: 60000 });
        collector.on("collect", (reaction) => {
            switch(reaction.emoji.name) {
            case "▶️":
                i++;
                if (i >= pages.length) i = 0;
                msg.edit({ embed: pages[i] });
                break;
            case "◀️":
                i--;
                if (i < 0) i = pages.length - 1;
                msg.edit({ embed: pages[i] });
                break;
            }
        });
    }
}

module.exports = DiscordEmbedPages;