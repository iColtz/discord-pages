const { Message, MessageEmbed } = require("discord.js");

class DiscordEmbedPages {
    constructor(pages, message) {
        this.pages = pages instanceof Array ? pages : [];

        this.message = (message instanceof Message) ? message : null;

        this.currentPageNumber = 0;

        this.pages.forEach(embed => {
            if (!(embed instanceof MessageEmbed)) throw new Error("An element in the pages array is not a discord message embed.");
        });
    }

    async createPages(message) {
        try {
            this.msg = await message.channel.send({ embed: this.pages[0] });
            await this.msg.react("◀️");
            await this.msg.react("▶️");
        } catch (error) { return console.warn(error); }
        const filter = (reaction, user) => user.id === message.author.id;
        const collector = this.msg.createReactionCollector(filter, { time: 60000 });
        collector.on("collect", (reaction) => {
            switch(reaction.emoji.name) {
            case "▶️":
                return this.nextPage();
            case "◀️":
                return this.previousPage();
            }
        });
    }

    nextPage() {
        this.currentPageNumber++;
        if (this.currentPageNumber >= this.pages.length) this.currentPageNumber = 0;
        this.msg.edit({ embed: this.pages[this.currentPageNumber] });
    }

    previousPage() {
        this.currentPageNumber--;
        if (this.currentPageNumber < 0) this.currentPageNumber = this.pages.length - 1;
        this.msg.edit({ embed: this.pages[this.currentPageNumber] });
    }
}

module.exports = DiscordEmbedPages;