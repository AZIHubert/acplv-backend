const DataLoader = require('dataloader');

const User = require('../models/User');
const ServiceCat = require('../models/ServiceCat');

const users = async userIds => {
    try {
        userIds = userIds.map(userId => User.findById(userId));
        const users = await Promise.all(userIds)
        return users;
    } catch(err) {
        throw new Error(err);
    }
};

const userLoader = new DataLoader(userIds => {
    return users(userIds)
});

const userGetter = async function(userIds){
    let users;
    if(userIds)
        users = await userLoader.load(userIds);
    else users = null;
    return users;
};

const populateUser = user => userGetter(user);

const serviceCats = async serviceCatIds => {
    try {
        serviceCatIds = serviceCatIds.map(serviceCatId => ServiceCat.findById(serviceCatId));
        let serviceCats = await Promise.all(serviceCatIds);
        serviceCats = serviceCats.map(serviceCat => {
            return {
                ...serviceCat._doc,
                _id: serviceCat._id,
                createdBy: userGetter(serviceCat.createdBy)
            }
        });
        
        return serviceCats;
    } catch(err) {
        throw new Error(err);
    }
};

const serviceCatLoader = new DataLoader(serviceCatIds => serviceCats(serviceCatIds));

const serviceCatGetter = async function(serviceCatId){
    let serviceCat;
    if(serviceCatId)
        serviceCat = await serviceCatLoader.load(serviceCatId);
    else serviceCat = null;
    return serviceCat;
};

const populateServiceCat = service => ({
    ...service._doc,
    _id: service._id,
    createdBy: userGetter(service.createdBy),
    serviceCat: serviceCatGetter(service.serviceCat)
});

module.exports.userGetter = userGetter;
module.exports.serviceCatGetter = serviceCatGetter;