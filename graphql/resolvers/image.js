const Image = require('../../models/Image');
const Project = require('../../models/Project');
const checkAuth = require('../../util/checkAuth');
const cloudinary = require('cloudinary').v2;
const { transformImage } = require('../../util/merge');

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
                images = images.map(image => transformImage(image));
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
                return transformImage(image);
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async uploadImage(_, {
            imageFile,
            projectId
        }, context){
            const user = checkAuth(context);
            try {
                const {createReadStream, mimetype} = await imageFile;
                if(mimetype !== 'image/jpeg' && mimetype !== 'image/png')
                    throw new Error('Must be a valid image (.jpg/.jpeg/.png)');
                const fileStream = createReadStream();
                const file = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader
                        .upload_stream({
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
                    url: file.url,
                    project: projectId,
                    uploadAt: file.created_at,
                    uploadBy: user._id
                });
                let image = await newImage.save();
                image = transformImage(image);
                await Project.findByIdAndUpdate(projectId, {
                    $set: {thumbnail: image._id}
                });
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
                const oldImageId = image._id;
                await cloudinary.uploader.destroy(image.filenameInvalid,  {
                    type: "authenticated"
                },(err, res) => {
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    if(res){
                        console.log(res)
                    }
                });
                await image.delete();
                await Project.updateMany({
                    thumbnail: {$eq: oldImageId}
                }, {
                    thumbnail: null
                });
                return 'Image deleted successfully';
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}