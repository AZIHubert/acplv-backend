const express = require('express');
const { ApolloServer  } = require('apollo-server-express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')


  

const {
	MONGODB
} = require('./config.js');

const graphqlEndpoint = '/graphql';

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: false,
    context: ({req}) => ({req})
});
const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Origin",
      "*"
    );
    next();
});
app.use(graphqlEndpoint, bodyParser.json());

server.applyMiddleware({ app, cors: { origin: 'http://acplv.com', credentials: true } });

mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('mongoDB connected...');
    return app.listen({ port });
}).then(() => {
    console.log(`GraphQL available at http://localhost:${port}${server.graphqlPath}`);
    console.log('To quit, type CRTL+c');
}).catch(err => {
    console.log(err);
});

// TODO: Change errors by apollo errors