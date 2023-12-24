module.exports = {
    data: {
        name: 'template',
        description: '설명',
        options: []
    },

    run: ({ interaction }) => {
        interaction.reply({
            content:
                `내용` 
        });
    },

    deleted: true
}