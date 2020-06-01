const {
    model,
    Schema
} = require('mongoose');

const generalSchema = new Schema({
    primaryColor: String,
    secondaryColor: String,
    tertiaryColor: String,
    email: String,
    phone: String,
    whoAreWeFirst: String,
    whoAreWeSecond: String,
    about: String,
    adressStreet: String,
    adressCity: String,
    facebook: {
        isActive: Boolean,
        link: String
    },
    instagram: {
        isActive: Boolean,
        link: String
    },
    linkedin: {
        isActive: Boolean,
        link: String
    }
});

module.exports = model('General', generalSchema);