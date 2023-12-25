const { ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../schemas/UserProfile');

const { ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'register',
        description: 'Robr Pay 회원가입 절차를 밟습니다. 약관은 /terms 명령어로 확인할 수 있습니다. ',
        options: []
    },

    run: async ({ interaction }) => {
        try {
            let userProfile = await UserProfile.findOne({
                userId: interaction.user.id,
            });

            await interaction.deferReply({ ephemeral: true });

            if (userProfile) {
                interaction.editReply({
                    content: "이미 Robr Pay 회원입니다. ",
                    ephemeral: true
                });

                return;
            }

            let registerButton = new ButtonBuilder()
            .setLabel('회원가입 완료하기')
            .setStyle(ButtonStyle.Success)
            .setCustomId('register-button');

            const termsButton = new ButtonBuilder()
            .setLabel('약관 보기')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/tjwhang/RobrPay/blob/main/TERMS.md')

            const buttonRow = new ActionRowBuilder().addComponents(registerButton, termsButton);

            const registerForm = await interaction.editReply({
                content:
                `# Robr Pay 회원가입 절차를 시작합니다.\n아래 내용을 확인해 주세요.\n\n1. 설정에서 서버 멤버에게 DM 받기를 켜주세요. 앞으로 모든 사용 내역과 개인적인 내용들은 DM으로 알려드릴 예정입니다.\n2. 이용 약관을 꼭 읽으세요. 회원가입을 하는 것은 이 약관에 동의하는 것으로 간주합니다.\n3. 회원가입 시 자동으로 Discord 계정과 Robr Pay 계정이 연동됩니다.\n\n위 내용을 확인하셨다면 아래 버튼을 눌러 회원가입을 완료해 주세요. `,
                components: [buttonRow],
                ephemeral: true,
            })

            const filter = (i) => i.user.id === interaction.user.id;

            const registerFormCollecter = registerForm.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });
            
            registerFormCollecter.on('collect', async (bi) => {
                // await bi.deferReply({ ephemeral: true });
                if (bi.customId === 'register-button') {
                    if (!userProfile) {
                        userProfile = new UserProfile({
                            userId: interaction.user.id,
                        });
                        userProfile.save();
                    }             

                    interaction.editReply({
                        content: `회원가입이 완료되었습니다. 환영합니다, ${interaction.user}님! `,
                    });
                    interaction.user.send("Robr Pay 회원가입이 완료되었습니다. 이용해 주셔서 감사합니다. 앞으로 모든 사용 내역과 개인적인 내용들은 DM으로 전송됩니다. ");                    
                    registerButton.setLabel('회원가입 완료됨');
                    registerButton.setDisabled(true);
                    await bi.update({
                        components: [buttonRow]
                    })
                    return registerButton;
                }
                return buttonRow;
            });

        } catch (error) {
            console.log(`오류: ${error}`);
        }
    },

    deleted: false,
    
}