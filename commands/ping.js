module.exports = {
    data: {
        name: 'ping',
        description: '봇 지연시간 (ms)',
        options: []
    },

    run: ({ interaction }) => {
        interaction.reply({
            content:
                `API 지연시간: ${interaction.client.ws.ping}ms\n메시지 지연시간: ${Date.now() - interaction.createdTimestamp}ms\n봇 지연시간: ${Date.now() - interaction.createdTimestamp - interaction.client.ws.ping}ms`,
            ephemeral: true,
        });
    }
}