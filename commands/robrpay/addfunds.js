module.exports = {
    data: {
        name: 'addfunds',
        description: 'Robr Cash를 충전을 요청합니다. 당사자가 승인하면 충전됩니다. ',
        options: []
    },

    run: ({ interaction }) => {
        interaction.reply({
            content:
                `내용` 
        });
    },

    deleted: false
}