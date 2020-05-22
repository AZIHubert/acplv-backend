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
    createdAt: String
});

module.exports = model('ServiceCat', serviceCat);