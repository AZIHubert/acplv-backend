const Service = require('../../models/Service');
const ServiceCat = require('../../models/ServiceCat');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Query: {
        async getServices(){
            try{
                const services = await Service.find()
                    .sort({index: 1})
                    .populate('createdBy')
                    .populate('serviceCat');
                return services;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getService(_, {
            serviceId
        }){
            try{
                if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
                    const service = await Service.findById(serviceId)
                        .populate('createdBy')
                        .populate('serviceCat');
                    if(service) return service;
                    else throw new Error('Service not found');
                } else throw new Error('Invalid ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createService(_, {
            serviceInput: {
                title,
                serviceCatId
            }
        }, context){
                const user = checkAuth(context);
                try {
                    const serviceExist = await Service.find({
                        "title": {$regex: new RegExp(title, "i")}
                    });
                    if(serviceExist){
                        throw new Error('Service already exist');
                    }
                    if (serviceCatId !== undefined){
                        if(serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                            const servicesCat = await ServiceCat.findById(serviceCatId);
                            if(!servicesCat){
                                throw new Error('serviceCat not found');
                            }
                        } else throw new Error('Invalid serviceCat ObjectId');
                    }
                    const servicesByCat = await Service.find().where({
                        serviceCat: serviceCatId
                    });
                    const newService = new Service({
                        title,
                        index: servicesByCat.length,
                        serviceCat: serviceCatId,
                        createdAt: new Date().toISOString(),
                        createdBy: user._id
                    });
                    let service = await newService.save();
                    service = await service
                        .populate('createdBy')
                        .populate('serviceCat')
                        .execPopulate();
                    return service;
                } catch(err) {
                    throw new Error(err);
                }
        },
        async editService(_, {
            serviceId,
            ServiceInput: {
                title,
                index,
                serviceCatId
            }
        }, context){
            checkAuth(context);
            try{
                const serviceExist = await Service.find({
                    "title": {$regex: new RegExp(title, "i")}
                });
                if(serviceExist){
                    throw new Error('Service already exist')
                }
                if (serviceCatId !== undefined){
                    if(serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                        const servicesCat = await ServiceCat.findById(serviceCatId);
                        if(!servicesCat){
                            throw new Error('serviceCat not found');
                        }
                    } else throw new Error('Invalid serviceCat ObjectId');
                }
                if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
                    let service = await Service.findByIdAndUpdate(serviceId, {
                        title,
                        index,
                        serviceCatId
                    });
                    service = await service
                        .populate('createdBy')
                        .populate('serviceCat')
                        .execPopulate();
                    return service;
                } else throw new Error('Invalid service ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        },
        async deleteService(_, {
            serviceId
        }, context){
            checkAuth(context);
            try{
                if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
                    const service = await Service.findById(serviceId);
                    if(service) {
                        let serviceCat = service.serviceCat;
                        const index = service.index;
                        await service.delete();
                        await Service.updateMany({
                            $and: [
                                {serviceCat},
                                {index: {$gte: index}}
                            ]
                        }, {
                            $inc: {index: -1}
                        });
                        return 'Service deleted successfully';
                    } else throw new Error('Service not found');
                } else throw new Error('Invalid ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}