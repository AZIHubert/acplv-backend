const mongoose = require('mongoose');
const Service = require('../../models/Service');
const ServiceCat = require('../../models/ServiceCat');
const checkAuth = require('../../util/checkAuth');
const {transformService} = require('../../util/merge');

module.exports = {
    Query: {
        async getServices(){
            try{
                let services = await Service.find().sort({index: 1});
                services = services.map(service => transformService(service));
                return services;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getServicesByCat(_, {
            serviceCatId
        }){
            try{
                if(!serviceCatId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const servicesCat = await ServiceCat.findById(serviceCatId);
                if(!servicesCat) throw new Error('serviceCat not found');
                let services = await Service.find({
                    serviceCat: serviceCatId
                }).sort({index: 1});
                services = services.map(service => transformService(service));
                return services;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getService(_, {
            serviceId
        }){
            try{
                if (serviceId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                let service = await Service.findById(serviceId);
                if(service) throw new Error('Service not found');
                return transformService(service);
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createService(_, {
            title,
            serviceCatId
        }, context){
                const user = checkAuth(context);
                try {
                    if(title.trim() === '') throw new Error('Can\'t have an empty title');
                    const serviceExist = await Service.findOne({
                        title
                    });
                    if(serviceExist) throw new Error('Service already exist');
                    if(!serviceCatId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid serviceCat ObjectId');
                    const newService = new Service({
                        title,
                        index: 0,
                        serviceCat: serviceCatId === undefined ? null : serviceCatId,
                        createdAt: new Date().toISOString(),
                        createdBy: user._id
                    });
                    const serviceCat = await ServiceCat.findById(serviceCatId);
                    serviceCat.services.push(service._id);
                    await serviceCat.save();
                    await Service.updateMany({
                        serviceCat: serviceCatId
                    }, {
                        $inc: {index: 1}
                    });
                    let service = await newService.save();
                    return transformService(service);
                } catch(err) {
                    throw new Error(err);
                }
        },
        async editService(_, {
            serviceId,
            title
        }, context){
            checkAuth(context);
            try{
                if(title.trim() === '') throw new Error('Can\'t be empty');
                if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid service ObjectId');
                let service = await Service.findById(serviceId);
                if(!service) throw new Error('Service not found');
                const serviceExist = await Service.findOne({
                    title
                });
                if(serviceExist) throw new Error('Service already exist');
                if(title === service.title) throw new Error('not changed');
                service.title = title;
                service = await service.save(); 
                return transformService(service);
            } catch (err) {
                throw new Error(err);
            }
        },
        async moveService(_, {
            serviceId,
            index,
            serviceCatId
        }, context){
            checkAuth(context);
            try{
                if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid service ObjectId');
                if (serviceCatId !== undefined){
                    if(!serviceCatId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid serviceCat ObjectId')
                    const serviceCat = await ServiceCat.findById(serviceCatId);
                    if(!serviceCat) throw new Error('ServiceCat not found');
                }
                let service = await Service.findById(serviceId);
                const serviceByCat = await Service.find({
                    serviceCat: {$eq: serviceCatId}
                });
                if(index < 0 || index > serviceByCat.length) throw new Error('Index out of range');
                if(!service) throw new Error('Service not found');
                let oldIndex = service.index;
                let oldServiceCatId = service.serviceCat;
                service.index = index;
                service.serviceCat = serviceCatId;
                await Service.updateMany({
                    $and: [
                        {serviceCat: oldServiceCatId},
                        {_id: {$ne: serviceId}},
                        {index: {$gte: oldIndex}}
                    ]
                }, {
                    $inc: {index: -1}
                });
                await Service.updateMany({
                    $and: [
                        {serviceCat: serviceCatId},
                        {_id: {$ne: serviceId}},
                        {index: {$gte: index}}
                    ]
                }, {
                    $inc: {index: 1}
                });
                service = await service.save();
                console.log(oldServiceCatId, serviceCatId)
                await ServiceCat.findByIdAndUpdate(oldServiceCatId, {
                    $pull: {services: mongoose.Types.ObjectId(serviceId)}
                });
                await ServiceCat.findByIdAndUpdate(serviceCatId, {
                    $push: {services: serviceId}
                });
                return 'Service successfully moved';
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteService(_, {
            serviceId
        }, context){
            checkAuth(context);
            try{
                if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const service = await Service.findById(serviceId);
                if(!service) throw new Error('Service not found');
                let serviceCatId = service.serviceCat;
                const index = service.index;
                await service.delete();
                await Service.updateMany({
                    $and: [
                        {serviceCat: serviceCatId},
                        {index: {$gte: index}}
                    ]
                }, {
                    $inc: {index: -1}
                });
                const serviceCat = await ServiceCat.findById(serviceCatId);
                const newServicesList = serviceCat.services.filter(service => service._id != serviceId);
                serviceCat.services = newServicesList;
                await serviceCat.save();
                return 'Service deleted successfully';
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}