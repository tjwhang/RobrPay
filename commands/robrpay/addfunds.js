const { ApplicationCommandOptionType } = require("discord.js");
const { Client, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');
const index = require('../../index.js');
const client = index.client;

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
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "서버에서만 사용할 수 있는 명령어입니다. ",
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
                    payAmount = targetAmount * 0.001 * 1.5;
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
                        label: 'Kakao Pay/Bank',
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
                
                const selectionForm = await interaction.editReply({
                    content: `# Robr Cash 충전\n## ${option1} Robr Cash \n### 1. 결제 수단 선택\n주의: 충전 요청은 액수가 누적되며, 마지막으로 선택된 결제 수단으로 전체 액수를 결제해야 합니다.\n1분 안에 다음 단계로 넘어가지 않으면 결제가 자동으로 취소됩니다. \n결제 수단을 선택하면 바로 다음 단계로 넘어갑니다. `,
                    components: [actionRow],
                });

                const sCollector = selectionForm.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
                    time: 60_000,
                });

                sCollector.on('collect', async (si) => {
                    interaction.editReply(`# Robr Cash 충전\n## 상품   ${option1} Robr Cash\n## 값   ${payAmount} ${option2}\n### 2. 충전 요청 완료하기\n충전 요청을 완료하려면 아래의 지침을 따라주세요. 지침을 확인 및 수행하셨다면 다음을 누르세요. 1분 동안 아무 행동을 하지 않으면 자동으로 요청이 취소됩니다. `);
                    selectMenu.setDisabled(true);
                    //await si.deferReply({ ephemeral: true })
                    await si.update({
                        components: [actionRow]
                    });
                    
                    //si.followUp(si.values[0]);
                    switch (si.values[0]) {
                        case 'toss':
                            if (option2 === 'OTHER') { si.followUp({ content: `DM으로 환율을 별도 문의하세요. `, ephemeral: true }) }
                            si.followUp({ content: `Toss 뱅크 ${process.env.TOSS_ACCOUNT_NUMBER}로 ${payAmount} ${option2}을(를) 송금해 주세요. `, ephemeral: true  });
                            break;
                        case 'kakao':
                            if (option2 === 'OTHER') { si.followUp({ content: `DM으로 환율을 별도 문의하세요. `, ephemeral: true }) }
                            si.followUp({ content: `Kakao Bank/Kakao Pay ${process.env.KAKAO_ACCOUNT_NUMBER} 또는 Kakao 개인 연락처를 통해 ${payAmount} ${option2}을(를) 송금해 주세요. `, ephemeral: true });
                            break;
                        case 'offline':
                            if (option2 === 'OTHER') { si.followUp({ content: `DM으로 기간 및 환율을 별도 문의하세요. `, ephemeral: true }) }
                            si.followUp({ content: `DM으로 기간 협의 후 직접 만나 ${payAmount} ${option2}을(를) 송금해 주세요. `, ephemeral: true });
                            break;
                        default:
                            si.followUp({ content: "오류가 발생했습니다. 다시 시도해 주세요. ", ephemeral: true });
                            break;
                    }

                    const nextButton = new ButtonBuilder()
			        .setCustomId('add-next')
			        .setLabel('다음')
			        .setStyle(ButtonStyle.Success);
                    
                    const nextButtonRow = new ActionRowBuilder().addComponents(nextButton);

                    const finishForm = await si.followUp({ content: "다음 버튼을 누르면 충전 요청이 전송됩니다. ", ephemeral: true, components: [nextButtonRow] });

                    const finishFormCollector = finishForm.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        filter: (i) => i.user.id === interaction.user.id && i.customId === 'add-next',
                        time: 60_000,
                    });
                        
                    //     .createMessageComponentCollector({
                    //     componentType: ComponentType.Button,
                    //     //filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
                    //     time: 60_000,
                    // });

                    finishFormCollector.on('collect', (fi) => {
                        if (fi.customId === 'add-next') {
                            userProfile.pendingCashAmount = targetAmount;
                            userProfile.pendingCashMethod = si.values[0];
                            try {
                                console.log(client?.users);
                                if (client?.users != undefined) {
                                    client?.users.send(process.env.OWNER_ID,{
                                       content: `# Robr Cash 충전 요청\n### ${interaction.user} (${interaction.user.id})\n충전액: $   {targetAmount} Robr Cash\n지불액: ${payAmount} ${option2}\n결제 수단: ${si.values[0]}\n\n확인 후   승인 또는 거절을 결정하십시오. 승인은 /accept, 거절은 /reject 명령어를 사용하세요.` 
                                    });
                                    console.log(`DM 전송 완료`);
                                }                       
                            } catch (error) {
                                console.log(`DM 전송 오류: ${error}`)
                            }
                            // console.log(`# Robr Cash 충전 요청\n### ${interaction.user} (${interaction.user.id})\n충전액: ${targetAmount} Robr Cash\n지불액: ${payAmount} ${option2}\n결제 수단: ${si.values[0]}\n\n확인 후 승인 /또는 거절을 결정하십시오. 승인은 /accept, 거절은 /reject 명령어를 사용하세요.`);
                            fi.reply({
                                content: `# Robr Cash 충전\n## ${option1} Robr Cash\n### 3. 완료\n충전 요청이 완료되었습니다. 승인되면 DM으로 알려드리겠습니다. 이용해 주셔서 감사합니다. `,
                                components: [],
                                ephemeral: true,
                            });
                            fi.user.send({
                                content: `# 귀하의 Robr Cash 충전 요청\n충전액: ${targetAmount} Robr Cash\n지불액: ${payAmount} ${option2}\n결제 수단: ${si.values[0]}\n\n승인을 기다리는 중입니다. `,
                            });
                            return;
                        }
                    });
                    
                    
                    
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