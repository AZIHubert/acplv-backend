const Service = require('../../models/Service');
const ServiceCat = require('../../models/ServiceCat');
const checkAuth = require('../../util/checkAuth');
const {serviceCatGetter, userGetter} = require('../../util/populate');

module.exports = {
    Query: {
        async getServices(){
            try{
                let services = await Service.find()
                    .sort({index: 1});
                services = services.map(service => ({
                    ...service._doc,
                    _id: service._id,
                    createdBy: userGetter(service.createdBy),
                    serviceCat: serviceCatGetter(service.serviceCat)
                }));
                return services;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getServicesByCat(_, {
            serviceCatId
        }){
            try{
                if(serviceCatId.match(/^[0-9a-fA-F]{24}$/)) {
                    const servicesCat = await ServiceCat.findById(serviceCatId);
                    if(servicesCat){
                        let services = await Service.find({
                            serviceCat: serviceCatId
                        }).sort({index: 1});
                        services = services.map(service => ({
                            ...service._doc,
                            _id: service._id,
                            createdBy: userGetter(service.createdBy),
                            serviceCat: serviceCatGetter(service.serviceCat)
                        }));
                        console.log(services)
                        return services;
                    } else throw new Error('serviceCat not found');
                } else throw new Error('Invalid serviceCat ObjectId');
            } catch(err) {
                throw new Error(err);
            }
        },
        async getService(_, {
            serviceId
        }){
            try{
                if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
                    let service = await Service.findById(serviceId);
                    if(service) {
                        service = {
                            ...service._doc,
                            _id: service._id,
                            createdBy: userGetter(service.createdBy),
                            serviceCat: serviceCatGetter(service.serviceCat)
                        };
                        return service;
                    }
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
                    const serviceExist = await Service.findOne({
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
                    service = {
                        ...service._doc,
                        _id: service._id,
                        createdBy: userGetter(service.createdBy),
                        serviceCat: serviceCatGetter(service.serviceCat)
                    };
                    return service;
                } catch(err) {
                    throw new Error(err);
                }
        },
        async editService(_, {
            serviceId,
            serviceInput: {
                title,
                serviceCatId
            }
        }, context){
            checkAuth(context);
            try{
                const service = await Service.findById(serviceId);
                if(!service){
                    throw new Error('Service not found');
                }
                const serviceExist = await Service.findOne({
                    $and: [
                        {"_id": {$ne: serviceId}},
                        {"title": {$regex: new RegExp(title, "i")}}
                    ]
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
                    if(title !== service.title || serviceCatId !== service.serviceCat.toString()){
                        let service = await Service.findByIdAndUpdate(serviceId, {
                            title,
                            serviceCat: serviceCatId
                        }, {new: true});
                        service = {
                            ...service._doc,
                            _id: service._id,
                            createdBy: userGetter(service.createdBy),
                            serviceCat: serviceCatGetter(service.serviceCat)
                        };
                        return service;
                    } else throw new Error('Service has not changed');
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