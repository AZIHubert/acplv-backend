const General = require('../../models/General');
const Image = require('../../models/Image');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Query: {
        async getGeneral(){
            try{
                let general = await General.findOne();
                if(!general) {
                    const newGeneral = new General({
                        primaryColor: '#000',
                        secondaryColor: '#fff',
                        tertiaryColor: '#e4ac49',
                        email: null,
                        phone: null,
                        about: null,
                        whoAreWeFirst: null,
                        whoAreWeSecond: null,
                        facebookLink: null,
                        instagramLink: null,
                        linkedinLink: null,
                        adressStreet: null,
                        adressCity: null
                    });
                    general = await newGeneral.save();
                }
                return general
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async editGeneral(_, {
            generalInput: {
                primaryColor, secondaryColor, tertiaryColor,
                email, phone, about, whoAreWeFirst, whoAreWeSecond,
                facebookLink, instagramLink, linkedinLink,
                adressStreet, adressCity
            }
        }, context){
            checkAuth(context);
            try {
                if(email !== undefined && email.trim() !== ''){
                    if(!email.match(/^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/))
                    throw new Error('Must be a valid email adress');
                }
                const editedGeneral = await General.findOne();
                let general;
                if(!!editedGeneral){
                    editedGeneral.primaryColor = primaryColor !== undefined ? primaryColor : editedGeneral.primaryColor;
                    editedGeneral.secondaryColor = secondaryColor !== undefined ? secondaryColor : editedGeneral.secondaryColor;
                    editedGeneral.tertiaryColor = tertiaryColor !== undefined ? tertiaryColor : editedGeneral.tertiaryColor;
                    editedGeneral.email = email !== undefined ? email : editedGeneral.email;
                    editedGeneral.phone = phone !== undefined ? phone : editedGeneral.phone;
                    editedGeneral.about = about !== undefined ? about : editedGeneral.about;
                    editedGeneral.whoAreWeFirst = whoAreWeFirst !== undefined ? whoAreWeFirst : editedGeneral.whoAreWeFirst;
                    editedGeneral.whoAreWeSecond = whoAreWeSecond !== undefined ? whoAreWeSecond : editedGeneral.whoAreWeSecond;
                    editedGeneral.facebookLink = facebookLink !== undefined ? facebookLink : editedGeneral.facebookLink;
                    editedGeneral.linkedinLink = linkedinLink !== undefined ? linkedinLink : editedGeneral.linkedinLink;
                    editedGeneral.instagramLink = instagramLink !== undefined ? instagramLink : editedGeneral.instagramLink;
                    editedGeneral.adressCity = adressCity !== undefined ? adressCity : editedGeneral.adressCity;
                    editedGeneral.adressStreet = adressStreet !== undefined ? adressStreet : editedGeneral.adressStreet;
                    general = await editedGeneral.save();
                } else {
                    const newGeneral = new General({
                        primaryColor: primaryColor !== undefined ? primaryColor : '#000',
                        secondaryColor: secondaryColor !== undefined ? secondaryColor : '#fff',
                        tertiaryColor: tertiaryColor !== undefined ? tertiaryColor : '#e4ac49',
                        email: null,
                        phone: null,
                        about: null,
                        whoAreWeFirst: null,
                        whoAreWeSecond: null,
                        facebookLink: null,
                        instagramLink: null,
                        linkedinLink: null,
                        adressCity: null,
                        adressStreet: null
                    });
                    general = await newGeneral.save();
                }
                return general;
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}