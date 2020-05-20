const {
    model,
    Schema
} = require('mongoose');

const serviceSchema = new Schema({
    title: String,
    index: Number,
    serviceCat: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCat'
    }
});

module.exports = model('Service', serviceSchema);