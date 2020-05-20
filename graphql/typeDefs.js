const {
    gql
} = require('apollo-server');

module.exports = gql`
    type Service {
        _id: ID!
        title: String!
        index: Int!
        serviceCat: ID
    }
    type User {
        _id: ID!
        email: String!
        token: String!
        username: String!
        isActive: Boolean!
        createdAt: String!
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
        registerConfirmation: String!
    }
    type Query {
        getServices: [Service!]!
    }
    type Mutation {
        register(registerInput: RegisterInput): User!
        login(emailOrUsername: String!, password: String): User!
    }
`;