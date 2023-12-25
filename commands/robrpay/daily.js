const UserProfile = require('../../schemas/UserProfile');

const dailyAmount = 100;

module.exports = {
    data: {
        name: 'daily',
        description: "일일 보상으로 100 Robr Points를 받습니다. ",
    },

    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "서버에서만 사용할 수 있는 명령어입니다. ",
            });
            return;
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            let userProfile = await UserProfile.findOne({
                userId: interaction.member.id,
            });

            if (userProfile) {
                const lastDailyDate = userProfile.lastDaily?.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                    interaction.editReply({
                        content: "이미 오늘의 보상을 받았습니다. ",
                        ephemeral: true
                    });
                    return;
                }
            }
            else {
                interaction.editReply({
                    content: "회원이 아닙니다. /register로 회원가입 하세요.",
                    ephemeral: true
                });
                return;
            }

            userProfile.points += dailyAmount;
            userProfile.lastDaily = new Date();

            await userProfile.save();

            interaction.editReply({
                content: `${dailyAmount} Robr Points를 받았습니다. `,
                ephemeral: true
            });
            interaction.member.send(`입금 정보\n+${dailyAmount} Robr Points\n비고: 일일 보상`);

        } catch (error) {
            console.log(`오류: ${error}`);
        }
    }
    
}