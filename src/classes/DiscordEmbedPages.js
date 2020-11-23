const { TextChannel, MessageEmbed } = require("discord.js");

/**
 * Options used to determine how to embed pages should be constructed.
 * @typedef {Object} PagesOptions
 * @prop {Array} pages - An array of message embed that will be in the embed pages.
 * @prop {Discord.TextChannel} channel - The channel the embed pages will be sent.
 * @prop {Number} [duration=60000] - The length the reaction collector will last.
 * @prop {Array<Snowflake>|String<Snowflake>|Function} [restricted] - The restricted users to the embed pages.
 * @prop {Boolean} [pageFooter=true] - Whether or not to have the page counter on the embed footer.
 */

class DiscordEmbedPages {
    /**
     * Created the embed pages.
     * @param {PagesOptions} options - Options for the embed pages. 
     */
    constructor({
        pages,
        channel,
        duration,
        restricted,
        pageFooter,
    } = {}) {
        /**
         * List of pages for the embed pages.
         * @type {Array<Discord.MessageEmbed>}
         */
        this.pages = pages;

        /**
         * Channel to send the embed pages to.
         * @type {Discord.TextChannel}
         */
        this.channel = channel;

        /**
         * How long the reactions collector will last in milliseconds.
         * @type {Number}
         */
        this.duration = duration || 60000;

        /**
         * Only user's that can use the embed reactions.
         * @type {Array<Snowflake>|String<Snowflake>|Function}
         */
        this.restricted = restricted;

        /**
         * Whether to have a page counter on the embed footers.
         * @type {Boolean}
         */
        this.pageFooter = Boolean(pageFooter);

        /**
         * The current page number to embed pages is on.
         * @type {Number}
         */
        this.currentPageNumber = 0;

        this.validate();
    }

    /**
     * Creates and sends the embed pages.
     */
    createPages() {
        if (!this.pages[0]) throw new Error("Tried to create embed pages with no pages in the pages array.");
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

    /**
     * Turns the embed pages to the next page.
     */
    nextPage() {
        if (!this.msg) throw new Error("Tried to go to next page but embed pages havn't been created yet.");
        this.currentPageNumber++;
        if (this.currentPageNumber >= this.pages.length) this.currentPageNumber = 0;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * Turns the embde pages to the previous page.
     */
    previousPage() {
        if (!this.msg) throw new Error("Tried to go to previous page but embed pages havn't been created yet.");
        this.currentPageNumber--;
        if (this.currentPageNumber < 0) this.currentPageNumber = this.pages.length - 1;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * Adds a page to the embed pages.
     * @param {Discord.MessageEmbed} embed - Embed that is added to the embed pages.
     */
    addPage(embed) {
        if (!this.msg) throw new Error("Tried to add page before embed pages have even been created.");
        if (!(embed instanceof MessageEmbed)) throw new Error("Adding embed is not a instance of a message embed.");
        this.pages.push(embed);
        const currentEmbed = this.pages[this.currentPageNumber];
        if (this.pageFooter) currentEmbed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: currentEmbed });
    }

    /**
     * Removes a page from the embed pages.
     * @param {Number} pageNumber - The page index that is removed.
     */
    deletePage(pageNumber) {
        if (!this.msg) throw new Error("Tried to delete page before embed pages have even been created.");
        if (pageNumber < 0 || pageNumber > this.pages.length - 1) throw new Error("Deleting page does not exist.");
        this.pages.splice(pageNumber, 1);
        if (this.pages.length === this.currentPageNumber) {
            this.currentPageNumber--;
            const embed = this.pages[this.currentPageNumber];
            if (!embed) return this.delete();
            if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
            this.msg.edit({ embed: embed });
        }
        else {
            const embed = this.pages[this.currentPageNumber];
            if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
            this.msg.edit({ embed: embed });
        }
    }

    /**
     * Turns the embed pages to a certain page.
     * @param {Number} pageNumber - The page index that is turned to.
     */
    turnToPage(pageNumber) {
        if (!this.msg) throw new Error("Tried to turn to page before embed pages have even been created.");
        if (pageNumber < 0 || pageNumber > this.pages.length - 1) throw new Error("Turning page does not exist.");
        this.currentPageNumber = pageNumber;
        const embed = this.pages[this.currentPageNumber];
        if (this.pageFooter) embed.setFooter(`Page: ${this.currentPageNumber + 1}/${this.pages.length}`);
        this.msg.edit({ embed: embed }).catch(() => null);
    }

    /**
     * Deletes the embed pages.
     */
    delete() {
        if (!this.msg) throw new Error("Tried to delete embed pages but they havn't even been created yet.");
        this.msg.delete().catch(() => null);
    }

    /**
     * Validates the embed pages options are correct.
     */
    validate() {
        if (!Array.isArray(this.pages)) {
            throw new Error("Pages option needs to be an array.");
        }
        else if (this.pages.some(page => !(page instanceof MessageEmbed))) {
            throw new Error("An element in the pages array is not a discord message embed.");
        }
        else if (!(this.channel instanceof TextChannel)) {
            throw new Error("Channel needs to be a discord text channel.");
        }
        else if (this.duration && typeof duration !== "number") {
            throw new Error("Duration needs to be a number.");
        }
        else if (this.pageFooter && typeof pageFooter !== "boolean") {
            throw new Error("PageFooter needs to be a boolean.");
        }
        else if (this.restricted && (typeof restricted !== "string" && typeof restricted !== "function" && !Array.isArray(this.restricted))) {
            throw new Error("Restricted needs to be a string, object or function");
        }
    }
}

module.exports = DiscordEmbedPages;