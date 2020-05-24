const {
    model,
    Schema
} = require('mongoose');

const generalSchema = new Schema({
    logo: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    favicon: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    headerImage: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    primaryColor: String,
    secondaryColor: String,
    tertiaryColor: String,
    email: String,
    phone: String,
    whoAreWe: String,
    about: String,
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