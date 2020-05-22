const {
    model, Schema
} = require('mongoose');

const clientSchema = new Schema({
    title: String,
    index: Number,
    createdAt: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('Client', clientSchema);