import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandUserOption } from 'discord.js';
import { Command } from '../../structure/Command';
import { User } from '../../schemas/User';
import { Embed, EmbedColor } from '../../structure/Embed';
import emojis from '../../json/emojis.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Gives money to a specified user.')
		.addUserOption(
			new SlashCommandUserOption()
				.setName('user')
				.setDescription('The user to give the money to.')
				.setRequired(true)
		)
		.addIntegerOption(
			new SlashCommandIntegerOption()
				.setName('amount')
				.setDescription('The amount to give.')
				.setMinValue(1)
				.setRequired(true)
		),

	async onCommandInteraction(interaction: ChatInputCommandInteraction) {
		const receiver = interaction.options.getUser('user');

		if (receiver.bot) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						title: 'Error',
						description: 'You can not give money to a bot!',
					}),
				],
				ephemeral: true,
			});
			return;
		}

		if (interaction.user.id == receiver.id) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						title: 'Error',
						description: 'You can not give money to yourself!',
					}),
				],
				ephemeral: true,
			});
			return;
		}

		const user = await User.findById(interaction.user.id);

		if (!user || user.balance == 0) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						title: 'Error',
						description:
							'You do not have any money. Try using </work:1177662316414783518> to earn some.',
					}),
				],
				ephemeral: true,
			});
			return;
		}

		const amount = interaction.options.getInteger('amount');

		if (user.balance < amount) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						title: 'Error',
						description: 'You do not have this much money!',
					}),
				],
				ephemeral: true,
			});
			return;
		}

		interaction.reply({
			embeds: [
				new Embed({
					color: EmbedColor.primary,
					title: 'Give',
					description: `You gave ${receiver} ${amount.toLocaleString()} ${emojis.coin}!`,
				}),
			],
		});

		user.balance -= amount;
		user.save();

		await User.findById(receiver.id).then(dbReceiver => {
			if (!dbReceiver) {
				User.create({ _id: receiver.id, balance: amount });
				return;
			}

			dbReceiver.balance += amount;
			dbReceiver.save();
		});
	},
} satisfies Command;