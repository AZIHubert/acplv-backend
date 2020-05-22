const Image = require('../../models/Image');
const checkAuth = require('../../util/checkAuth');
const cloudinary = require('cloudinary').v2;
const {userGetter} = require('../../util/merge');

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require('../../config');

cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
  });

module.exports = {
    Query: {
        async getImages(){
            // TODO: get all images (orderby date)
        },
        async getImage(_, {
            imageId
        }){
            // TODO: get singleimage
        }
    },
    Mutation: {
        async uploadImage(_, {
            imageFile,
            folder
        }, context){
            const user = checkAuth(context);
            try {
                const {createReadStream, mimetype} = await imageFile;
                if(mimetype !== 'image/jpeg' || mimetype !== 'image/png')
                    throw new Error('Must be a valid image (.jpg/.jpeg/.png)');
                const fileStream = createReadStream();
                const file = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader
                        .upload_stream({
                            folder,

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
                    folder,
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
                await cloudinary.uploader.destroy(`${image.folder}/${image.filename}`, err => {
                    if(err){
                        throw new Error(err);
                    }
                });
                await image.delete();
                // TODO: find projects with this image and set image to null
                return 'Image deleted successfully';
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}