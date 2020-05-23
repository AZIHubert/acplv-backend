const DataLoader = require('dataloader');

const User = require('../models/User');
const Service = require('../models/Service');
const ServiceCat = require('../models/ServiceCat');
const Project = require('../models/Project');
const Type = require('../models/Type');

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

// Project //
const projectsGetter = async function(projectsId){
    if(!!projectsId.length)
        return await projectLoader.loadMany(projectsId);
    else return [];
};
const projectLoader = new DataLoader(projectsId => services(projectsId));
const projects = async projectsId => {
    try {
        projectsId = projectsId.map(projectId => Project.findById(projectId));
        let projects = await Promise.all(projectsId);
        projects = projects.map(project => {
            return {
                ...project._doc,
                _id: project._id,
                createdBy: () => userGetter(project.createdBy),
                type: () => projectsGetter(project.type)
            }
        }).sort((a, b) => a.index - b.index);
        return projects;
    } catch(err) {
        throw new Error(err);
    }
};

// Type //
const typeGetter = async function(typeId){
    if(typeId)
        return await typeLoader.load(typeId);
    else return null;
};
const typeLoader = new DataLoader(typeIds => type(typeIds));
const type = async typeIds => {
    try {
        typeIds = typeIds.map(typeId => Type.findById(typeId));
        let types = await Promise.all(typeIds);
        types = types.map(type => {
            return {
                ...type._doc,
                _id: type._id,
                createdBy: () => userGetter(type.createdBy),
                projects: () => projectsGetter(type.projects)
            }
        });
        return types;
    } catch(err) {
        throw new Error(err);
    }
};

const transformService = service => ({
    ...service._doc,
    _id: service._id,
    createdBy: () => userGetter(service.createdBy),
    serviceCat: () => serviceCatGetter(service.serviceCat)
});
const transformServiceCat = serviceCat => ({
    ...serviceCat._doc,
    _id: serviceCat._id,
    createdBy: () => userGetter(serviceCat.createdBy),
    services: () => servicesGetter(serviceCat.services)
});
const transformProject = project => ({
    ...project._doc,
    _id: project._id,
    createdBy: () => userGetter(project.createdBy),
    type: () => typeGetter(project.type)
});
const transformType = type => ({
    ...type._doc,
    _id: type._id,
    createdBy: () => userGetter(type.createdBy),
    projects: () => projectsGetter(type.projects)
})

module.exports.userGetter = userGetter;
module.exports.transformService = transformService;
module.exports.transformServiceCat = transformServiceCat;
module.exports.transformProject = transformProject;
module.exports.transformType = transformType;
