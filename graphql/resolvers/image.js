const Image = require('../../models/Image');
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
                const images = Image.fing();
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
                if (imageId.match(/^[0-9a-fA-F]{24}$/)) {
                    let image = await Image.findById(imageId);
                    if(imageId) {
                        image = {
                            ...image._doc,
                            _id: image._id,
                            uploadBy: userGetter(image.uploadBy)
                        }
                        return image;
                    } else throw new Error('Image not found');
                } else throw new Error('Invalid ObjectId');
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
                const {createReadStream, mimetype} = await imageFile;
                if(mimetype !== 'image/jpeg' || mimetype !== 'image/png')
                    throw new Error('Must be a valid image (.jpg/.jpeg/.png)');
                if(type !== 'thumbnail' || type !== 'logo' || type !== 'general')
                    throw new Error('Wrong type (need to be \\thumbnail/logo/general\\)');
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
                const image = await Image.findById(imageId);
                // TODO: Maybe add folder/filename but in this case, what about upload preset folder ?
                await cloudinary.uploader.destroy(image.filename, err => {
                    if(err){
                        throw new Error(err);
                    }
                });
                await image.delete();
                // TODO: find projects with this image and set image to null
                //       find logo or favicon and set to null
                //       find header image and set to null if type = ''
                return 'Image deleted successfully';
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}