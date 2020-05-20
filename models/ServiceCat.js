const {
    model,
    Schema
} = require('mongoose');

const serviceCat = new Schema({
    title: String,
    index: Number
});

module.exports = model('ServiceCat', serviceCat);