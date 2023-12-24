const Cooldown = require('../../schemas/Cooldown');
const UserProfile = require('../../schemas/UserProfile');

function getRandomNumber(x, y) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
}

module.exports = {
    data: {
        name: 'beg',
        description: 'Robr Cash나 Robr Points를 구걸합니다. ',
        options: []
    },

    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "이 명령어는 서버에서만 사용할 수 있습니다.",
                ephemeral: true
            });
            
            return;
        }

        try {
            await interaction.deferReply();

            const commandName = 'beg';
            const userId = interaction.user.id;
            let cooldown = await Cooldown.findOne({
                userId, commandName
            });

            if (cooldown && Date.now() < cooldown.endsAt) {
                const { default: prettyMs } = await import('pretty-ms');
                await interaction.editReply({
                    content: `쿨다운이 ${prettyMs(cooldown.endsAt - Date.now())} 남았습니다.`,
                    ephemeral: true
                });
                return;
            }
            if (!cooldown) {
                cooldown = new Cooldown({
                    userId, commandName
                });
            }

            cooldown.endsAt = Date.now() + 300000;


        } catch (error) {
            console.log(`오류 발생: /beg, 오류 내용: ${error}`)
        }
    },

    deleted: false
}