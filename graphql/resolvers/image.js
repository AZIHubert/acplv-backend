const Image = require('../../models/Image');
const Project = require('../../models/Project');
const checkAuth = require('../../util/checkAuth');
const cloudinary = require('cloudinary').v2;
const {userGetter} = require('../../util/merge');

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_UPLOAD_PRESET
} = require('../../config');

cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
  });

module.exports = {
    Query: {
        async getImages(){
            try{
                const images = await Image.find();
                images = images.map(image => ({
                    ...image._doc,
                    _id: image._id,
                    uploadBy: userGetter(image.uploadBy)
                }));
                return images;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getImage(_, {
            imageId
        }){
            try{
                if (!imageId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                let image = await Image.findById(imageId);
                if(imageId) throw new Error('Image not found');
                image = {
                    ...image._doc,
                    _id: image._id,
                    uploadBy: userGetter(image.uploadBy)
                }
                return image;
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async uploadImage(_, {
            imageFile,
            type
        }, context){
            const user = checkAuth(context);
            try {
                if(mimetype !== 'image/jpeg' || mimetype !== 'image/png')
                    throw new Error('Must be a valid image (.jpg/.jpeg/.png)');
                if(type !== 'thumbnail' || type !== 'logo' || type !== 'headerImage' || type !== 'favicon')
                    throw new Error('Wrong type (need to be \\thumbnail/logo/favicon/headerImage\\)');
                const {createReadStream, mimetype} = await imageFile;
                const fileStream = createReadStream();
                const file = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader
                        .upload_stream({
                            folder: type,
                            upload_preset: CLOUDINARY_UPLOAD_PRESET
                        }, (err, res) => {
                        if(res) {
                            resolve(res)
                        } else {
                            reject(err);
                        }
                    });
                    fileStream.pipe(cloudStream);
                });
                const newImage = new Image({
                    filename: file.public_id,
                    url: file.public_id,
                    uploadAt: file.created_at,
                    type,
                    uploadBy: user._id
                });
                let image = await newImage.save();
                image = {
                    ...image._doc,
                    _id: image._id,
                    createdBy: userGetter(image.createdBy)
                };
                return image;
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteImage(_, {
            imageId
        }, contex){
            checkAuth(contex);
            try{
                if (!imageId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const image = await Image.findById(imageId);
                if(!image) throw new Error('Image not found');
                const imageId = image._id;
                const imageType = image.type;
                // TODO: Maybe add folder/filename but in this case, what about upload preset folder ?
                await cloudinary.uploader.destroy(image.filename, err => {
                    if(err){
                        throw new Error(err);
                    }
                });
                await image.delete();
                if(imageType === "project"){
                    await Project.updateMany({
                        thumbnail: {$eq: imageId}
                    }, {
                        thumbnail: null
                    });
                }
                if(imageType === "logo"){

                }
                if(imageType === "favicon"){

                }
                if(imageType === "headerImage"){

                }
                return 'Image deleted successfully';
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}