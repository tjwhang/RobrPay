module.exports = {
    data: {
        name: 'terms',
        description: 'Robr Pay의 약관을 확인합니다.',
        options: []
    },

    run: ({ interaction }) => {
        interaction.reply({
            content:
                `https://github.com/tjwhang/RobrPay/blob/main/TERMS.md` 
        });
    },

    deleted: false
}