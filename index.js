const express = require('express');
const { ApolloServer  } = require('apollo-server-express');
const mongoose = require('mongoose');

const {
	MONGODB
} = require('./config.js');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    context: ({req}) => ({req})
});
const app = express();
const port = process.env.port || 3000;

server.applyMiddleware({ app });


mongoose.connect(MONGODB, {
    useNewUrlParser: true
}).then(() => {
    console.log('mongoDB connected...');
    return app.listen({ port });
}).then(res => {
    console.log(`GraphQL available at http://localhost:${port}${server.graphqlPath}`)
});

// TODO: create emailSender