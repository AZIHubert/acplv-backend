const {
    model,
    Schema
} = require('mongoose');

const emailSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    company: String,
    subject: String,
    body: String,
    createdAt: String
});

module.exports = model('Email', emailSchema);