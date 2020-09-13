'use strict';
require('dotenv').config()
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const fetch = require("node-fetch");
let bazaarData;
console.log("Starting...")
//next error code: 4
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
            name: "sbr$help",
            type: "PLAYING"
        }
    });
})//("https://api.mojang.com/users/profiles/minecraft/" + username).json()['id']
client.on('message', message => {
    if(message.channel.id in messageCooldownList) {
        if(messageCooldownList[message.channel.id]+commandCooldown < time())    {
            if((message.content.slice(0,4)).toUpperCase() == "SBR$") {
                let content = message.content.slice(4).split(' ');
                // commands
                try {
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
                                })
                        }   else  {
                            // averaging buy/sell price
                            let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                            let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                            message.reply(discordResponse);
                        }
                    }   else if ((content[0]).toUpperCase() == 'HELP')   {
                        let discordResponse = ['**Commands:**', '**sbr$rate** - Calculates current coin price using the booster cookie price on bazaar.','**sbr$snowflakemeter** ``username`` - calculates a users\'s Snowflake score using various settings including their chat filter settings.', '*SbExchangeRates#1931 is owned by ThomasG#4988*'];
                        message.reply(discordResponse);
                        lastBazaarDownload = time();
                    }   else if ((content[0]).toUpperCase() == 'SNOWFLAKEMETER') {
                        let username = content[1];
                        if (username == undefined)  {
                            message.reply("**SnowflakeMeter requires arg: ``username``")
                        }   else    {
                            fetch("https://api.mojang.com/users/profiles/minecraft/" + username)
                                .then(raw => raw.json())
                                .then(data => {
                                    if ('name' in data)  {
                                        let uuid = data['id'];
                                        fetch("https://api.hypixel.net/player?key=d16dc479-a24f-4c10-98b1-77b14d7fccfa&uuid=" + uuid)
                                            .then(rawPlayerData => rawPlayerData.json())
                                            .then(playerData => {
                                                if (playerData['success'] == true)  {
                                                    try {
                                                        let snowflakeScore;
                                                        if(playerData['player']['settings']['allowFriendRequest'] == false) {
                                                            snowflakeScore = 15;
                                                        }   else    {
                                                            snowflakeScore = 0;
                                                        }
                                                        if(playerData['player']['settings']['bloodVisibility'] == false) {
                                                            snowflakeScore += 20;
                                                        }
                                                        if(playerData['player']['settings']['allowPartyRequests'] == false) {
                                                            snowflakeScore += 15;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel'] == 'STRONG_FILTER')   {
                                                            snowflakeScore += 10;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_PARTY'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_PARTY'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_GUILD'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_GUILD'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_PM'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_PM'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['privateMessagePrivacy'] == 'MAX')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'HIGH')  {
                                                            snowflakeScore += 8;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'MEDIUM')  {
                                                            snowflakeScore += 5;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'LOW')  {
                                                            snowflakeScore += 3;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'NONE')  {
                                                            snowflakeScore += 0;
                                                        }
                                                        if(playerData['player']['settings']['friendRequestPrivacy'] == 'MAX')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'HIGH')  {
                                                            snowflakeScore += 7;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'LOW')  {
                                                            snowflakeScore += 3;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'NONE')  {
                                                            snowflakeScore += 0;
                                                        }
                                                        message.reply("**" + username + "**'s Snowflake Score is **" + (Math.floor(snowflakeScore/110*100)) + "%**")
                                                    }   catch   {
                                                        message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 1 + "``");
                                                    }
                                                }
                                            })
                                    }   else    {
                                        try {
                                            message.reply("**"+data['errorMessage']+"**");
                                        }   catch   {
                                            message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 2 + "``");
                                        }
                                    }
                                })
                        }
                    }   else   {
                        message.reply("Command not recognised try ``sbr$help``")
                    }
                    let channelId = message.channel.id;
                    messageCooldownList[channelId] = time();
                }   catch  {
                    message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 3 + "``");s
                }
            }
        }   else{
            // On cooldown
        }
    }   else    {
            if((message.content.slice(0,4)).toUpperCase() == "SBR$") {
                let content = message.content.slice(4).split(' ');
                // commands
                try {
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
                                })
                        }   else  {
                            // averaging buy/sell price
                            let boosterCookiePrice = Math.floor((bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['buyPrice']+bazaarData["products"]["BOOSTER_COOKIE"]["quick_status"]['sellPrice'])/2);
                            let discordResponse = ("**$1** is equal to **" + Math.floor(boosterCookiePrice/dollarsPerBoosterCookie) + " coins**");
                            message.reply(discordResponse);
                        }
                    }   else if ((content[0]).toUpperCase() == 'HELP')   {
                        let discordResponse = ['**Commands:**', '**sbr$rate** - Calculates current coin price using the booster cookie price on bazaar.','**sbr$snowflakemeter** ``username`` - calculates a users\'s Snowflake score using various settings including their chat filter settings.', '*SbExchangeRates#1931 is owned by ThomasG#4988*'];
                        message.reply(discordResponse);
                        lastBazaarDownload = time();
                    }   else if ((content[0]).toUpperCase() == 'SNOWFLAKEMETER') {
                        let username = content[1];
                        if (username == undefined)  {
                            message.reply("**SnowflakeMeter requires arg: ``username``")
                        }   else    {
                            fetch("https://api.mojang.com/users/profiles/minecraft/" + username)
                                .then(raw => raw.json())
                                .then(data => {
                                    if ('name' in data)  {
                                        let uuid = data['id'];
                                        fetch("https://api.hypixel.net/player?key=d16dc479-a24f-4c10-98b1-77b14d7fccfa&uuid=" + uuid)
                                            .then(rawPlayerData => rawPlayerData.json())
                                            .then(playerData => {
                                                if (playerData['success'] == true)  {
                                                    try {
                                                        let snowflakeScore;
                                                        if(playerData['player']['settings']['allowFriendRequest'] == false) {
                                                            snowflakeScore = 15;
                                                        }   else    {
                                                            snowflakeScore = 0;
                                                        }
                                                        if(playerData['player']['settings']['bloodVisibility'] == false) {
                                                            snowflakeScore += 20;
                                                        }
                                                        if(playerData['player']['settings']['allowPartyRequests'] == false) {
                                                            snowflakeScore += 15;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel'] == 'STRONG_FILTER')   {
                                                            snowflakeScore += 10;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_PARTY'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_PARTY'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_GUILD'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_GUILD'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['profanityLevel_PM'] == 'STRONG_FILTER')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['profanityLevel_PM'] == 'WEAK_FILTER')  {
                                                            snowflakeScore += 5;
                                                        }
                                                        if(playerData['player']['settings']['privateMessagePrivacy'] == 'MAX')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'HIGH')  {
                                                            snowflakeScore += 8;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'MEDIUM')  {
                                                            snowflakeScore += 5;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'LOW')  {
                                                            snowflakeScore += 3;
                                                        }   else if(playerData['player']['settings']['privateMessagePrivacy'] == 'NONE')  {
                                                            snowflakeScore += 0;
                                                        }
                                                        if(playerData['player']['settings']['friendRequestPrivacy'] == 'MAX')    {
                                                            snowflakeScore += 10;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'HIGH')  {
                                                            snowflakeScore += 7;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'LOW')  {
                                                            snowflakeScore += 3;
                                                        }   else if(playerData['player']['settings']['friendRequestPrivacy'] == 'NONE')  {
                                                            snowflakeScore += 0;
                                                        }
                                                        message.reply("**" + username + "**'s Snowflake Score is **" + (Math.floor(snowflakeScore/110*100)) + "%**")
                                                    }   catch   {
                                                        message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 1 + "``");
                                                    }
                                                }
                                            })
                                    }   else    {
                                        try {
                                            message.reply("**"+data['errorMessage']+"**");
                                        }   catch   {
                                            message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 2 + "``");
                                        }
                                    }
                                })
                        }
                    }   else   {
                        message.reply("Command not recognised try ``sbr$help``")
                    }
                    let channelId = message.channel.id;
                    messageCooldownList[channelId] = time();
                }   catch  {
                    message.channel.send("Error, if this persists contact ``ThomasG#4988`` with code: ``" + 3 + "``");s
                }
            }
        }
})