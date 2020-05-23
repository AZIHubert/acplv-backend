const {
    model,
    Schema
} = require('mongoose');

const serviceCat = new Schema({
    title: String,
    index: Number,
    createdAt: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: String,
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Service'
    }]
});

module.exports = model('ServiceCat', serviceCat);