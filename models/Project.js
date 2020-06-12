const {
    model,
    Schema
} = require('mongoose');

const projectSchema = new Schema({
    title: String,
    index: Number,
    display: Boolean,
    type: {
        type: Schema.Types.ObjectId,
        ref: 'Types'
    },
    createdAt: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    thumbnail: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }
});

module.exports = model('Project', projectSchema);