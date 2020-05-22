const projectResolvers = require('./project');
const serviceCatResolvers = require('./serviceCat');
const serviceResolvers = require('./service');
const userResolvers = require('./user');

module.exports = {
    Query: {
        ...serviceResolvers.Query,
        ...serviceCatResolvers.Query
        // ...projectResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...serviceResolvers.Mutation,
        ...serviceCatResolvers.Mutation
        // ...projectResolvers.Mutation
    }
}