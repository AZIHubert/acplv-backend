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
                serviceCat = await serviceCat.populate('createdBy').execPopulate();
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
                    const serviceCat = await ServiceCat.findById(serviceCatId);
                    if(title !== serviceCat.title){
                        let serviceCatEdited = await ServiceCat.findByIdAndUpdate(serviceCatId, {
                            title
                        }, {new: true});
                        serviceCatEdited = await serviceCatEdited
                            .populate('createdBy')
                            .execPopulate();
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
                    } else throw new Error('ServiceCat not found');
                    return 'ServiceCat deleted successfully';
                } else throw new Error('Invalid ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}