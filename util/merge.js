const DataLoader = require('dataloader');

const User = require('../models/User');
const Service = require('../models/Service');
const ServiceCat = require('../models/ServiceCat');

// User //
const userGetter = async function(userIds){
    let users;
    if(userIds)
        users = await userLoader.load(userIds);
    else users = null;
    return users;
};
const userLoader = new DataLoader(userIds => users(userIds));
const users = async userIds => {
    try {
        userIds = userIds.map(userId => User.findById(userId));
        const users = await Promise.all(userIds)
        return users;
    } catch(err) {
        throw new Error(err);
    }
};

// ServiceCat //
const serviceCatGetter = async function(serviceCatId){
    let serviceCat;
    if(serviceCatId)
        serviceCat = await serviceCatLoader.load(serviceCatId);
    else serviceCat = null;
    return serviceCat;
};
const serviceCatLoader = new DataLoader(serviceCatIds => serviceCats(serviceCatIds));
const serviceCats = async serviceCatIds => {
    try {
        serviceCatIds = serviceCatIds.map(serviceCatId => ServiceCat.findById(serviceCatId));
        let serviceCats = await Promise.all(serviceCatIds);
        serviceCats = serviceCats.map(serviceCat => {
            return {
                ...serviceCat._doc,
                _id: serviceCat._id,
                createdBy: () => userGetter(serviceCat.createdBy),
                services: () => servicesGetter(serviceCat.services)
            }
        });
        
        return serviceCats;
    } catch(err) {
        throw new Error(err);
    }
};

// Service //
const servicesGetter = async function(serviceIds){
    let services;
    if(!!serviceIds.length)
        services = await serviceLoader.loadMany(serviceIds);
    else services = [];
    return services;
};
const serviceLoader = new DataLoader(serviceIds => services(serviceIds));
const services = async serviceIds => {
    try {
        serviceIds = serviceIds.map(serviceId => Service.findById(serviceId));
        let services = await Promise.all(serviceIds);
        services = services.map(service => {
            return {
                ...service._doc,
                _id: service._id,
                createdBy: () => userGetter(service.createdBy),
                serviceCat: () => serviceCatGetter(service.serviceCat)
            }
        }).sort((a, b) => a.index - b.index);
        return services;
    } catch(err) {
        throw new Error(err);
    }
};

const transformService = service => ({
    ...service._doc,
    _id: service._id,
    createdBy: () => userGetter(service.createdBy),
    serviceCat: () =>serviceCatGetter(service.serviceCat)
});
const transformServiceCat = serviceCat => ({
    ...serviceCat._doc,
    _id: serviceCat._id,
    createdBy: () => userGetter(serviceCat.createdBy),
    services: () => servicesGetter(serviceCat.services)
})

module.exports.userGetter = userGetter;
module.exports.transformService = transformService;
module.exports.transformServiceCat = transformServiceCat;
