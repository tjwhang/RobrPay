const { Schema, model } = require('mongoose');

const userProfileSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    cash: {
        type: Number,
        default: 0,
    },
    points: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
        default: null,
    },
},
{
    timestamps: true,
});

module.exports = model('userProfile', userProfileSchema);