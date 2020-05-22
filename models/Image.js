const {
    model,
    Schema
} = require('mongoose');

const imageSchema = new Schema({
    url: String
});

module.exports = model('Image', imageSchema);