import { Client, GatewayIntentBits, REST } from "discord.js";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { Command } from "./structure/Command";
import { DiscordEvent } from "./structure/DiscordEvent";

config(); // configures dotenv module to be able to use env variables

declare module "discord.js" {

   interface Client {

      commands: Command[];

   }

}

const client = new Client({intents: GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildPresences | GatewayIntentBits.Guilds}); // creates discord client
client.rest = new REST(); // creates a rest client
client.commands = []; // initializes the client's commands

fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {

	const command = require(path.join(path.join(__dirname, 'commands'), file));
   client.commands.push(command);

});

fs.readdirSync(path.join(__dirname, 'events')).forEach(file => {

	const event = require(path.join(path.join(__dirname, 'events'), file)) as DiscordEvent;
   
   if (event.once)
      client.once(file.split(/\./g)[0], event.execute);

   else
      client.on(file.split(/\./g)[0], event.execute);

});

process.on("uncaughtException", exception => {

   console.log(exception.stack);

});

client.login(process.env.token);
client.rest.setToken(process.env.token);