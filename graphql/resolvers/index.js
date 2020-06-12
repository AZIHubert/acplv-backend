const generalResolvers = require('./general');
const typeResolvers = require('./type');
const projectResolvers = require('./project');
const client = require('./client');
const serviceCatResolvers = require('./serviceCat');
const serviceResolvers = require('./service');
const userResolvers = require('./user');
const emailResolvers = require('./email');
const imageResolvers = require('./image');

module.exports = {
    Query: {
        ...generalResolvers.Query,
        ...projectResolvers.Query,
        ...typeResolvers.Query,
        ...client.Query,
        ...serviceResolvers.Query,
        ...serviceCatResolvers.Query,
        ...imageResolvers.Query
    },
    Mutation: {
        ...generalResolvers.Mutation,
        ...projectResolvers.Mutation,
        ...typeResolvers.Mutation,
        ...client.Mutation,
        ...userResolvers.Mutation,
        ...serviceResolvers.Mutation,
        ...serviceCatResolvers.Mutation,
        ...emailResolvers.Mutation,
        ...imageResolvers.Mutation
    }
}