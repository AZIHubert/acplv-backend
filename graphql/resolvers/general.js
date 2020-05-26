const General = require('../../models/General');
const Image = require('../../models/Image');
const {transformGeneral} = require('../../util/merge');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Query: {
        async getGeneral(){
            try{
                let general = await General.findOne();
                if(!general) {
                    const newGeneral = new General({
                        logo: null,
                        favicon: null,
                        headerImage: null,
                        primaryColor: '#000',
                        secondaryColor: '#fff',
                        tertiaryColor: '#e4ac49',
                        email: null,
                        phone: null,
                        about: null,
                        whoAreWeFirst: null,
                        whoAreWeSecond: null,
                        facebook: {
                            isActive: false,
                            link: null
                        },
                        instagram: {
                            isActive: false,
                            link: null
                        },
                        linkedin: {
                            isActive: false,
                            link: null
                        }
                    });
                    general = await newGeneral.save();
                }
                return transformGeneral(general)
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async editGeneral(_, {
            generalInput: {
                logoId, faviconId, headerImageId,
                primaryColor, secondaryColor, tertiaryColor,
                email, phone, about, whoAreWeFirst, whoAreWeSecond,
                facebookIsActive, facebookLink,
                instagramIsActive, instagramLink,
                linkedinIsActive, linkedinLink
            }
        }, context){
            checkAuth(context);
            try {
                if (logoId !== undefined){
                    if(!logoId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid logo ObjectId');
                    const logo = await Image.findById(logoId);
                    if(!logo) throw new Error('Logo not found');
                }
                if(faviconId !== undefined){
                    if(!faviconId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid favicon ObjectId');
                    const favicon = await Image.findById(faviconId);
                    if(!favicon) throw new Error('Favicon not found');
                }
                if(headerImageId !== undefined) {
                    if(!headerImageId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid headerImage ObjectId');
                    const headerImage = await Image.findById(headerImage);
                    if(!headerImage) throw new Error('headerImage not found');
                }
                if(email !== undefined && email.trim() !== ''){
                    if(!email.match(/^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/))
                    throw new Error('Must be a valid email adress');
                }
                const editedGeneral = await General.findOne();
                let general;
                if(!!editedGeneral){
                    editedGeneral.logo = logoId !== undefined ? logoId : editedGeneral.logoId;
                    editedGeneral.favicon = faviconId !== undefined  ? faviconId : editedGeneral.faviconId;
                    editedGeneral.headerImage = headerImageId !== undefined ? headerImageId : editedGeneral.headerImageId;
                    editedGeneral.primaryColor = primaryColor !== undefined ? primaryColor : editedGeneral.primaryColor;
                    editedGeneral.secondaryColor = secondaryColor !== undefined ? secondaryColor : editedGeneral.secondaryColor;
                    editedGeneral.tertiaryColor = tertiaryColor !== undefined ? tertiaryColor : editedGeneral.tertiaryColor;
                    editedGeneral.email = email !== undefined ? email : editedGeneral.email;
                    editedGeneral.phone = phone !== undefined ? phone : editedGeneral.phone;
                    editedGeneral.about = about !== undefined ? about : editedGeneral.about;
                    editedGeneral.whoAreWeFirst = whoAreWeFirst !== undefined ? whoAreWeFirst : editedGeneral.whoAreWeFirst;
                    editedGeneral.whoAreWeSecond = whoAreWeSecond !== undefined ? whoAreWeSecond : editedGeneral.whoAreWeSecond;
                    editedGeneral.facebook.isActive = facebookIsActive !== undefined ? facebookIsActive : editedGeneral.facebook.isActive;
                    editedGeneral.facebook.link = facebookLink !== undefined ? facebookLink : editedGeneral.facebook.link;
                    editedGeneral.linkedin.isActive = linkedinIsActive !== undefined ? linkedinIsActive : editedGeneral.linkedin.isActive;
                    editedGeneral.linkedin.link = linkedinLink !== undefined ? linkedinLink : editedGeneral.linkedin.link;
                    editedGeneral.instagram.isActive = instagramIsActive !== undefined ? instagramIsActive : editedGeneral.instagram.isActive;
                    editedGeneral.instagram.link = instagramLink !== undefined ? instagramLink : editedGeneral.instagram.link;
                    general = await editedGeneral.save();
                } else {
                    const newGeneral = new General({
                        logo: null,
                        favicon: null,
                        headerImage: null,
                        primaryColor: primaryColor !== undefined ? primaryColor : '#000',
                        secondaryColor: secondaryColor !== undefined ? secondaryColor : '#fff',
                        tertiaryColor: tertiaryColor !== undefined ? tertiaryColor : '#e4ac49',
                        email: null,
                        phone: null,
                        about: null,
                        whoAreWeFirst: null,
                        whoAreWeSecond: null,
                        facebook: {
                            isActive: facebookIsActive !== undefined ? facebookIsActive : false,
                            link: null
                        },
                        instagram: {
                            isActive: instagramIsActive !== undefined ? instagramIsActive : false,
                            link: null
                        },
                        linkedin: {
                            isActive: linkedinIsActive != undefined ? linkedinIsActive : false,
                            link: null
                        }
                    });
                    general = await newGeneral.save();
                }
                return transformGeneral(general)
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}