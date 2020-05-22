const ServiceCat = require('../../models/ServiceCat');
const Service =  require('../../models/Service');
const checkAuth = require('../../util/checkAuth');
const {userGetter} = require('../../util/populate');

module.exports = {
    Query: {
        async getServiceCats(){
            try{
                let serviceCats = await ServiceCat.find()
                    .sort({index: 1});
                serviceCats = serviceCats.map(serviceCat => ({
                    ...serviceCat._doc,
                    _id: serviceCat._id,
                    createdBy: userGetter(serviceCat.createdBy)
                }));
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
                    let serviceCat = await ServiceCat.findById(serviceCatId);
                    if(serviceCat) {
                        serviceCat = {
                            ...serviceCat._doc,
                            _id: serviceCat._id,
                            createdBy: userGetter(serviceCat.createdBy)
                        };
                        return serviceCat;
                    }
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
                const serviceCatExist = await ServiceCat.findOne({
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
                serviceCat = {
                    ...serviceCat._doc,
                    _id: serviceCat._id,
                    createdBy: userGetter(serviceCat.createdBy)
                }
                return serviceCat;
            } catch(err) {
                throw new Error(err);
            }
        },
        async editServiceCat(_, {
            serviceCatId,
            title
        }, context){
            checkAuth(context);
            try {
                const serviceCat = await ServiceCat.findById(serviceCatId);
                if(!serviceCat){
                    throw new Error('ServiceCat not found');
                }
                const serviceCatExist = await ServiceCat.findOne({
                    $and: [
                        {"title": {$regex: new RegExp(title, "i")}},
                        {"_id": {$ne: serviceCatId}}
                    ]
                });
                if(serviceCatExist){
                    throw new Error('ServiceCat already exist');
                }
                if (serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                    if(title !== serviceCat.title){
                        let serviceCatEdited = await ServiceCat.findByIdAndUpdate(serviceCatId, {
                            title
                        }, {new: true});
                        serviceCatEdited = {
                            ...serviceCatEdited._doc,
                            _id: serviceCatEdited._id,
                            createdBy: userGetter(serviceCatEdited.createdBy)
                        }
                        return serviceCatEdited;
                    } else throw new Error('ServiceCat has not changed');
                } else throw new Error('Invalid ObjectId');
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteServiceCat(_, {
            serviceCatId
        }, context){
            checkAuth(context);
            try {
                if (serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                    const serviceCat = await ServiceCat.findById(serviceCatId);
                    if(serviceCat){
                        const index = serviceCat.index;
                        await serviceCat.delete();
                        await ServiceCat.updateMany({
                            index: {$gte: index}
                        }, {
                            $inc: {index: -1}
                        });
                        await Service.updateMany({
                            serviceCat: { $eq: serviceCatId }
                        }, {
                            $set: {serviceCat: null}
                        });
                    } else throw new Error('ServiceCat not found');
                    return 'ServiceCat deleted successfully';
                } else throw new Error('Invalid ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}