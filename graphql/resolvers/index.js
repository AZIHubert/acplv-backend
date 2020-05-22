const projectResolvers = require('./project');
const client = require('./client');
const serviceCatResolvers = require('./serviceCat');
const serviceResolvers = require('./service');
const userResolvers = require('./user');

module.exports = {
    Query: {
        ...client.Query,
        ...serviceResolvers.Query,
        ...serviceCatResolvers.Query
        // ...projectResolvers.Query
    },
    Mutation: {
        ...client.Mutation,
        ...userResolvers.Mutation,
        ...serviceResolvers.Mutation,
        ...serviceCatResolvers.Mutation
        // ...projectResolvers.Mutation
    }
}