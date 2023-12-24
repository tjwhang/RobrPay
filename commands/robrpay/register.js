module.exports = {
    data: {
        name: 'register',
        description: 'Robr Pay 회원가입 절차를 밟습니다. ',
        options: []
    },

    run: ({ interaction }) => {
        let userProfile = UserProfile.findOne({
            userId: interaction.user.id,
        })

        if (userProfile) {
            interaction.reply({
                content: "이미 Robr Pay 회원입니다. ",
                ephemeral: true
            });
            return;
        }
        userProfile = new UserProfile({
            userId: interaction.user.id,
        });

        interaction.reply({
            content:
                `회원가입이 완료되었습니다. 환영합니다, ${interaction.user.username}님!` 
        });
    },

    deleted: false
}