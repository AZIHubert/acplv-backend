const {
    model,
    Schema
} = require('mongoose');

const socialNetworkSchema = new Schema({
    active: Boolean,
    link: String
});

const generalSchema = new Schema({
    favicon: String,
    headerImage: String,
    primaryColor: String,
    secondaryColor: String,
    tertiaryColor: String,
    email: String,
    phone: String,
    about: String,
    facebook: socialNetworkSchema,
    instagram: socialNetworkSchema,
    linkedin: socialNetworkSchema
});

module.exports = model('General', generalSchema);