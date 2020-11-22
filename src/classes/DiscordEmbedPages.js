const { TextChannel, MessageEmbed } = require("discord.js");

class DiscordEmbedPages {
    constructor({
        pages,
        channel,
        duration,
        restricted,
    } = {}) {
        this.validate(pages, channel, duration, restricted);

        this.pages = pages;

        this.channel = channel;

        this.duration = duration || 60000;

        this.restricted = restricted;

        this.currentPageNumber = 0;

        this.pages.forEach(embed => {
            if (!(embed instanceof MessageEmbed)) throw new Error("An element in the pages array is not a discord message embed.");
        });
    }

    createPages() {
        this.channel.send({ embed: this.pages[0] }).then(msg => {
            this.msg = msg;
            msg.react("◀️").catch(() => null);
            msg.react("▶️").catch(() => null);
            const filter = (reaction, user) => {
                if (user.bot) return false;
                if (!this.restricted) return true;
                else if (this.restricted instanceof Function) return this.restricted(user);
                else if (Array.isArray(this.restricted) && this.restricted.includes(user.id)) return true;
                else if (typeof this.restricted === "string" && this.restricted === user.id) return true;
            };
            const collector = msg.createReactionCollector(filter, { time: this.duration });
            collector.on("collect", (reaction) => {
                switch(reaction.emoji.name) {
                case "▶️":
                    return this.nextPage();
                case "◀️":
                    return this.previousPage();
                }
            });
        });
    }

    nextPage() {
        this.currentPageNumber++;
        if (this.currentPageNumber >= this.pages.length) this.currentPageNumber = 0;
        this.msg.edit({ embed: this.pages[this.currentPageNumber] }).catch(() => null);
    }

    previousPage() {
        this.currentPageNumber--;
        if (this.currentPageNumber < 0) this.currentPageNumber = this.pages.length - 1;
        this.msg.edit({ embed: this.pages[this.currentPageNumber] }).catch(() => null);
    }

    delete() {
        this.msg.delete().catch(() => null);
    }

    validate(pages, channel, duration, restricted) {
        if (!Array.isArray(pages)) {
            throw new Error("Pages option needs to be an array.");
        }
        else if (!(channel instanceof TextChannel)) {
            throw new Error("Channel needs to be a discord text channel.");
        }
        else if (duration && typeof duration !== "number") {
            throw new Error("Duration needs to be a number.");
        }
        else if (restricted && (typeof restricted !== "string" && typeof restricted !== "function" && !Array.isArray(restricted))) {
            throw new Error("Restricted needs to be a string, object or function");
        }
    }
}

module.exports = DiscordEmbedPages;