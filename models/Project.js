const {
    model,
    Schema
} = require('mongoose');

const projectSchema = new Schema({
    title: String,
    index: Number,
    display: Number,
    type: {
        type: Schema.Types.ObjectId,
        ref: 'types'
    },
    username: String,
    createdAt: String,
    thumbnailUrl: {
        type: Schema.Types.ObjectId,
        ref: 'image'
    }
});

module.exports = model('Project', projectSchema);