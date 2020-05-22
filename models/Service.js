const {
    model,
    Schema
} = require('mongoose');

const serviceSchema = new Schema({
    title: String,
    index: Number,
    createdAt: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    serviceCat: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCat'
    }
});

module.exports = model('Service', serviceSchema);