const Cooldown = require('../schemas/Cooldown');

module.exports = () => {
    setInterval(async () => {
        try {
            const cooldowns = await Cooldown.find().select('endsAt');
            for (const cooldown of cooldowns) {
                if (Date.now() > cooldown.endsAt) {
                    await cooldown.deleteOne({_id: cooldown._id});
                }
            }
        } catch (error) {
            console.log(`오류 발생: e:clearcooldown, 오류 내용: ${error}`)
        }
    }, 3.6e6);
}