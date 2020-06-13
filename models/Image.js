const {
    model,
    Schema
} = require('mongoose');

const imageSchema = new Schema({
    filename: String,
    format: String,
    url: String,
    uploadAt: String,
    uploadBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }
});

module.exports = model('Image', imageSchema);