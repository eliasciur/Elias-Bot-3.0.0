import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structure/Command";
import { User } from "../../schemas/User";
import { Embed } from "../../structure/Embed";
import emojis from "../../json/emojis.json";

module.exports = {

   data: new SlashCommandBuilder().setName("leaderboard").setDescription("Shows you the top 5 of the leaderboard."),

   async onCommandInteraction(interaction) {

      let description = '';
       
      const dbUsers = await User.find().sort({'balance': -1}).limit(5);
      await dbUsers.forEach(async (dbUser, index) => {

         const user = await interaction.client.users.fetch(dbUser.id);

         description += `#${++index} ${user.displayName}: ${dbUser.balance.toLocaleString()} ${emojis.coin}\n`;

      });

      interaction.reply({embeds: [new Embed({color: 0x22b1fc, title: 'Leaderboard', description: description})]});

   },

} satisfies Command