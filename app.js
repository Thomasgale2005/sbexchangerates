'use strict';
require('dotenv').config()
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const fetch = require("node-fetch");
let bazaarData;
function time() {
    let date = new Date();
    return(date.getTime());
}

function readJson(file) {
    try {
        const jsonString = fs.readFileSync(file);
        const data = JSON.parse(jsonString);
        return(data);
      } catch(err) {
        console.log(err);
        return
      }
}
console.log("1");
function writeJson(file, data)  {
    const jsonString = JSON.stringify(data);
    fs.writeFileSync(file, jsonString);
}
let lastBazaarDownload = 1000;
//reading config
let messageCooldownList = {};
let configJsonString = fs.readFileSync("./config.json");
const config = JSON.parse(configJsonString);
const apiKey = process.env.API_KEY;
const discordBotToken = process.env.BOT_TOKEN;
const dollarsPerBoosterCookie = config["dollarsPerBoosterCookie"];
const bazaarDownloadCooldown = config["bazaarDownloadCooldown"]; 
const commandCooldown = config["commandCooldown"];
const commandCooldownWipeCooldown = config["commandCooldownWipeCooldown"];

setInterval(() => {
    messageCooldownList = {}
}, commandCooldownWipeCooldown)
// logging in and starting bot
client.login(discordBotToken);
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        status: "online", 
        game: {
            name: "sbr$help",  // The message shown
            type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
        }
    });
})
console.log("2");
client.on('message', message => {
    if(message.channel.id in messageCooldownList) {
        if(messageCooldownList[message.channel.id]+commandCooldown < time())    {
            if((message.content.slice(0,4)).toUpperCase() == "SBR$") {
                let content = message.content.slice(4).split(' ');
                // commands
                if ((content[0]).toUpperCase() == 'RATE')   {
                    if (lastBazaarDownload+bazaarDownloadCooldown <= time()) {
                        fetch("https://api.hypixel.net/skyblock/bazaar?key="+apiKey)
                            .then(data => data.json())
                            .then(newData => {
                                bazaarData = newData;
                                // averaging buy/sell price
                                let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                                let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                                message.reply(discordResponse);
                                lastBazaarDownload = time();
                                let channelId = message.channel.id;
                                messageCooldownList[channelId] = time();
                            })
                    }   else  {
                        // averaging buy/sell price
                        let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                        let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                        message.reply(discordResponse);
                        let channelId = message.channel.id;
                        messageCooldownList[channelId] = time();
                    }
                }
                if ((content[0]).toUpperCase() == 'HELP')   {
                    let discordResponse = ['**Commands:**', '**sbr$rate** - Calculates current coin price using the booster cookie price on bazaar', '*SbExchangeRates#1931 is owned by ThomasG#4988*'];
                    message.reply(discordResponse);
                    lastBazaarDownload = time();
                    let channelId = message.channel.id;
                    messageCooldownList[channelId] = time();
                }
            }
        }   else{
            // On cooldown
        }
    }   else    {
            if((message.content.slice(0,4)).toUpperCase() == "SBR$") {
                let content = message.content.slice(4).split(' ');
                // commands
                if ((content[0]).toUpperCase() == 'RATE')   {
                    if (lastBazaarDownload+bazaarDownloadCooldown <= time()) {
                        fetch("https://api.hypixel.net/skyblock/bazaar?key="+apiKey)
                            .then(data => data.json())
                            .then(newData => {
                                bazaarData = newData;
                                // averaging buy/sell price
                                let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                                let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                                message.reply(discordResponse);
                                lastBazaarDownload = time();
                                let channelId = message.channel.id;
                                messageCooldownList[channelId] = time();
                            })
                    }   else  {
                        // averaging buy/sell price
                        let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                        let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                        message.reply(discordResponse);
                        let channelId = message.channel.id;
                        messageCooldownList[channelId] = time();
                    }
                }
                if ((content[0]).toUpperCase() == 'HELP')   {
                    let discordResponse = ['**Commands:**', '**sbr$rate** - Calculates current coin price using the booster cookie price on bazaar', '*SbExchangeRates#1931 is owned by ThomasG#4988*'];
                    message.reply(discordResponse);
                    lastBazaarDownload = time();
                    let channelId = message.channel.id;
                    messageCooldownList[channelId] = time();
                }
            }
        }
})