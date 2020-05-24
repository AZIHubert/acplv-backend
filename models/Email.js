const {
    model,
    Schema
} = require('mongoose');

const emailSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    company: String,
    phone: String,
    subject: String,
    body: String,
    sendAt: String
});

module.exports = model('Email', emailSchema);