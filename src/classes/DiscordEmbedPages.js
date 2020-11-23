const { TextChannel, MessageEmbed } = require("discord.js");

class DiscordEmbedPages {
    constructor({
        pages,
        channel,
        duration,
        restricted,
        pageFooter,
    } = {}) {
        this.validate(pages, channel, duration, restricted, pageFooter);

        this.pages = pages;

        this.channel = channel;

        this.duration = duration || 60000;

        this.restricted = restricted;

        this.pageFooter = Boolean(pageFooter);

        this.currentPageNumber = 0;

        this.pages.forEach(embed => {
            if (!(embed instanceof MessageEmbed)) throw new Error("An element in the pages array is not a discord message embed.");
        });
    }

    createPages() {
        if (this.pageFooter) this.pages[0].setFooter(`Page: 1/${this.pages.length}`);
        this.channel.send({ embed: this.pages[0] }).then(msg => {
            this.msg = msg;
            msg.react("◀️").catch(() => null);
            msg.react("▶️").catch(() => null);
            msg.react("⏹").catch(() => null);
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
                case "⏹":
                    return this.delete();
                }
            });
        });
    }

    nextPage() {
        this.currentPageNumber++;
        if (this.currentPageNumber >= this.pages.length) this.currentPageNumber = 0;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    previousPage() {
        this.currentPageNumber--;
        if (this.currentPageNumber < 0) this.currentPageNumber = this.pages.length - 1;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    addPage(embed) {
        if (!(embed instanceof MessageEmbed)) throw new Error("Adding embed is not a instance of a message embed.");
        this.pages.push(embed);
        const currentEmbed = this.pages[this.currentPageNumber];
        if (this.pageFooter) currentEmbed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: currentEmbed });
    }

    delete() {
        this.msg.delete().catch(() => null);
    }

    validate(pages, channel, duration, restricted, pageFooter) {
        if (!Array.isArray(pages)) {
            throw new Error("Pages option needs to be an array.");
        }
        else if (!(channel instanceof TextChannel)) {
            throw new Error("Channel needs to be a discord text channel.");
        }
        else if (duration && typeof duration !== "number") {
            throw new Error("Duration needs to be a number.");
        }
        else if (pageFooter && typeof pageFooter !== "boolean") {
            throw new Error("PageFooter needs to be a boolean.");
        }
        else if (restricted && (typeof restricted !== "string" && typeof restricted !== "function" && !Array.isArray(restricted))) {
            throw new Error("Restricted needs to be a string, object or function");
        }
    }
}

module.exports = DiscordEmbedPages;