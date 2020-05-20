const serviceResolvers = require('./service');
const userResolvers = require('./user');

module.exports = {
    Query: {
        ...serviceResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation
    }
}