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
    facebookLink: String,
    instagramLink: String,
    linkedinLink:  String
});

module.exports = model('General', generalSchema);