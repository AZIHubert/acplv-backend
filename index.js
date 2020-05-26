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
const port = process.env.port || 5000;

server.applyMiddleware({ app });

mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('mongoDB connected...');
    return app.listen({ port });
}).then(() => {
    console.log(`GraphQL available at http://localhost:${port}${server.graphqlPath}`);
    console.log('To quit, type CRTL+c');
});

// TODO: Change errors by apollo errors