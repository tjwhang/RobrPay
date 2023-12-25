const { ApplicationCommandOptionType } = require("discord.js");
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

module.exports = {
    data: {
        name: 'addfunds',
        description: 'Robr Cash를 충전을 요청합니다. 당사자가 승인하면 충전됩니다. ',
        options: [
            {
                name: 'amount',
                description: '충전할 Robr Cash 액수를 입력합니다. ',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
            {
                name: 'currency',
                description: '충전 통화 수단을 입력합니다. ',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: 'USD (미국 달러)',
                        value: 'USD',
                    },
                    {
                        name: 'KRW (대한민국 원)',
                        value: 'KRW',
                    },
                    {
                        name: '기타 화폐 (Robr Pay 와 협의)',
                        value: 'OTHER',
                    },
                ],
            }
        ]
    },

    run: async ({ interaction }) => {
        if (interaction.inGuild()) {
            interaction.reply({
                content: "DM으로만 사용할 수 있는 명령어입니다. 봇 DM으로 다시 시도해 주세요. ",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        const option1 = interaction.options.get('amount').value;
        const option2 = interaction.options.get('currency').value;

        if (option1 <= 0) {
            interaction.editReply({
                content: "유효한 금액을 입력하세요. ",
            });
            return;
        }
        
        try {
            let userProfile = await UserProfile.findOne({
                userId: interaction.user.id,
            });

            if (userProfile) {
                const targetAmount = option1;
                let payAmount;
                if (option2 === 'USD') {
                    payAmount = targetAmount * 0.001 * 1500;
                }
                else { payAmount = targetAmount; }
                const methods = [
                    {
                        label: 'Toss Bank',
                        description: '토스로 지불',
                        value: 'toss',
                        emoji: '🔵'
                    },
                    {
                        label: 'Kakao Bank',
                        description: '카카오로 지불',
                        value: 'kakao',
                        emoji: '🟡'
                    },
                    {
                        label: '오프라인',
                        description: '직접 만나서 지불',
                        value: 'offline',
                        emoji: '⚫'
                    }
                ]
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(interaction.id)
                    .setPlaceholder('결제 수단을 선택하세요. ')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        methods.map((methods) =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(methods.label)
                                .setDescription(methods.description)
                                .setValue(methods.value)
                                .setEmoji(methods.emoji)
                        )
                    );
                const actionRow = new ActionRowBuilder().addComponents(selectMenu);
                interaction.editReply({
                    content: `# Robr Cash 충전\n## \n### 1. 결제 수단 선택\n주의: 충전 요청은 액수가 누적되며, 마지막으로 선택된 결제 수단으로 전체 액수를 결제해야 합니다. `,
                    components: [actionRow],
                });
            } else {
                interaction.editReply({
                    content: "회원이 아닙니다. /register로 회원가입 하세요.",
                });
                return;
            }
        } catch (error) {
            console.log(`오류: ${error}`);
        }
    },

    deleted: false
}