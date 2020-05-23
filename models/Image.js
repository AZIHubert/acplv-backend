const {
    model,
    Schema
} = require('mongoose');

const imageSchema = new Schema({
    filename: String,
    format: String,
    url: String,
    uploadAt: String,
    type: String,
    uploadBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('Image', imageSchema);