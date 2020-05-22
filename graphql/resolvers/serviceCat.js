const ServiceCat = require('../../models/ServiceCat');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Query: {
        async getServiceCats(){
            try{
                const serviceCats = await ServiceCat.find()
                    .sort({index: 1})
                    .populate('createdBy');
                return serviceCats;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getServiceCat(_, {
            serviceCatId
        }){
            try{
                if (serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                    const serviceCat = await ServiceCat.findById(serviceCatId)
                        .populate('createdBy');
                    if(serviceCat) return serviceCat;
                    else throw new Error('ServiceCat not found');
                } else throw new Error('Invalid ObjectId');
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createServiceCat(_, {
            title
        }, context){
            const user = checkAuth(context);
            try{
                const serviceCatExist = await ServiceCat.find({
                    "title": {$regex: new RegExp(title, "i")}
                });
                if(serviceCatExist){
                    throw new Error('ServiceCat already exist');
                }
                const serviceCats = await ServiceCat.find();
                const newServiceCat = new ServiceCat({
                    title,
                    index: serviceCats.length,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id
                });
                let serviceCat = await newServiceCat.save();
                serviceCat = await serviceCat.populate('createdBy').execPopulate();
                return serviceCat;
            } catch(err) {
                throw new Error(err);
            }
        },
        async editServiceCat(_, {
            serviceCatId,
            serviceCatInput: {
                title,
                index
            }
        }, context){
            checkAuth(context);
            const serviceCatExist = await ServiceCat.findOne({
                'title': {$regex: new RegExp(title, "i")}
            });
            if(serviceCatExist){
                throw new Error('ServiceCat already exist');
            }
            if (serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                const serviceCat = await ServiceCat.findOneAndUpdate(serviceCatId, {
                    title,
                    index
                });
                serviceCat.populate('createdBy').execPopulate();
                return serviceCat;
            } else throw new Error('Invalid ObjectId');
        }
    }
}