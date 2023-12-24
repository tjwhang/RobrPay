const userProfile = require('../../schemas/UserProfile');

const dailyAmount = 100;

module.exports = {
    data: {
        name: 'daily',
        description: "일일 보상으로 100 Robr Points를 받습니다. ",
    },

    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "이 명령어는 서버에서만 사용할 수 있습니다.",
                ephemeral: true
            });
            
            return;
        }
        
        try {
            await interaction.deferReply({});

            let userProfile = await UserProfile.findOne({
                userId: interaction.user.id,
            })

            if (userProfile) {
                const lastDaily = userProfile.lastDaily?.toDateString();
                const today = new Date().toDateString();

                if (lastDaily === today) {
                    interaction.editReply({
                        content: "이미 오늘 일일 보상을 받았습니다.",
                        ephemeral: true
                    });
                    return;
                }
            }
            else {
                interaction.editReply({
                        content: "Robr Pay 회원이 아닙니다. /register 명령어로 Robr Pay 회원이 되어보세요!",
                        ephemeral: true
                });
                return;
            }
            userProfile.points += dailyAmount;
            userProfile.lastDaily = new Date();

            await userProfile.save();

            interaction.editReply(`+ ${dailyAmount} Robr Points (일일 보상)`);
        }
        catch {
            interaction.reply({
                content: "오류가 발생했습니다.",
                ephemeral: true
            });
            console.log(`오류 발생: /daily, 오류 내용: ${error}`)
        }
    }
    
}