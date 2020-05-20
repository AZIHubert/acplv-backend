const {
    model, Schema
} = require('mongoose');

const typeSchema = new Schema({
    title: String
});

module.exports = model('Type', typeSchema);