import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structure/Command";
import { User, defaultUser } from "../../schemas/User";
import { Embed } from "../../structure/Embed";
import emojis from "../../json/emojis.json";
import outcomes from "../../json/outcomes.json";

module.exports = {

   data: new SlashCommandBuilder().setName("beg").setDescription("Beg for some extra coins."),

   async onCommandInteraction(interaction) {

      const user = await User.findById(interaction.user.id) ??
         await User.create({_id: interaction.user.id, balance: 0, inventory: new Map()});
      const now = Math.floor(Date.now() / 1000);

      if (user.cooldowns.beg > now) {

         interaction.reply({embeds: [new Embed({color: 0xED4245, title: 'Error',
            description: `You are on cooldown! Come back <t:${user.cooldowns.beg}:R>`})], ephemeral: true});
         return;

      }

      const random = Math.round(Math.random());

      if (random == 0) {

         const money = Math.round(Math.random() * 200 + 300);

         user.balance += money;
   
         interaction.reply({embeds: [new Embed({color: 0x22b1fc, title: 'Beg',
            description: outcomes.beg.success[Math.floor(Math.random() * outcomes.beg.success.length)].replace("${money}", `${money} ${emojis.coin}`)})]});

      }

      else {

         interaction.reply({embeds: [new Embed({color: 0x22b1fc, title: 'Beg',
            description: outcomes.beg.fail[Math.floor(Math.random() * outcomes.beg.fail.length)]})]});

      }

      user.cooldowns.beg = now + 30;
      user.save();
       
   },

} satisfies Command