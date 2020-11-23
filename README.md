## discord-pages
**discord-pages** is an easy to use package for making discord embed pages, with many functions!
Build with discord.js@^12.0.0.
## Installation
```
npm install discord-pages
```
## Basic Example
```js
// Import MessageEmbed from discord.js
const { MessageEmbed } = require("discord.js");
// Import the discord-pages package
const DiscordPages = require("discord-pages");
const embed1 = new MessageEmbed()

// Create an array of embeds
const pages = [
	embed1,
	embed2,
	ect,
];

// Create a new embed page
// Pages param is an array of embeds
// Channel param is the TextChannel that you want to send the embed pages
const embedPages = new DiscordPages({ 
	pages: pages, 
	channel: channel, 
});
embedPages.createPages();
```
## Pages Options
- `pages` `(Array)` - An array of discord MessageEmbeds that will be in the embed pages.
- `channel` `(TextChannel)` - The discord TextChannel the message will be sent to.
- `duration` `(Number)` - The length the reaction collector will last. Default is 60000.
- `restricted` `(Array|String|Function)` - Restrict embed page reactions to be only used by certain users. Default if undefined.
- `pageFooter` `(Boolean)` - Whether to add a footer on embeds of the current page number. Default true.
## Extra Functions
**discord-pages** has many other functions for your embed pages.
- `embedPages.delete()` - Deletes the embed pages message.
- `embedPages.nextPage()` - Turns the embed pages to the next page.
- `embedPages.previousPage()` - Turns the embed pages to the previous page.
- `embedPages.addPage(embed)` - Adds a page to the embed pages. Parameter is a discord MessageEmbed.
- `embedPages.deletePage(pageNumber)` - Deletes the page from the embed pages. Parameter is the index of the page wanting to be removed.
- `embedPages.turnToPage(pageNumber)` - Turns the embed page to a certain page. Parameter is the index of the page wanting to be turned to.

## FAQ
#### How to only allow the author of the message to use the embed page reactions?
```js
const embedPages = new DiscordPages({ 
	pages: pages, 
	channel: channel, 
	restricted: (user) => user.id === message.author.id,
});
```

## Author
> © [iColtz](https://github.com/iColtz)