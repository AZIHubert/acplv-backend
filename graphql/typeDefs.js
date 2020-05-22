const {
    gql
} = require('apollo-server');

module.exports = gql`
    type Project {
        _id: ID!
        title: String!
        index: Int!
        display: Boolean!
        type: ID!
        username: ID!
        createdAt: String!
        thumbnailUrl: ID!
    }
    type Type {
        _id: ID!
        title: String
    }
    type ServiceCat {
        _id: ID!
        title: String!
        index: Int!
        createdBy: User!
        createdAt: String!
    }
    type Service {
        _id: ID!
        title: String!
        index: Int!
        createdAt: String!
        createdBy: User!
        serviceCat: ID
    }
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }
    type User {
        _id: ID!
        email: String!
        createdAt: String!
        username: String!
    }
    type CurrentUser {
        _id: ID!
        email: String!
        token: String!
        username: String!
        isActive: Boolean!
        createdAt: String!
    }
    input ProjectInput {
        title: String!
        index: Int!
        display: Boolean!
        type: ID!
        file: FileInput
    }
    input ServiceCatInput {
        title: String!
        index: Int!
    }
    input CreateServiceInput {
        title: String!
        serviceCatId: ID
    }
    input EditServiceInput {
        title: String!
        index: Int!
        serviceCatId: ID
    }
    input ServiceCatInput {
        title: String!
        index: Int!
    }
    input FileInput {
        filename: String!
        mimetype: String!
        encoding: String!
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
        registerConfirmation: String!
    }
    type Query {
        # getProjects: [Project]!
        # getProject(projectId: String!): Project
        getServiceCats: [ServiceCat]!
        getServiceCat(serviceCatId: ID!): ServiceCat!
        getServices: [Service]!
        getService(serviceId: ID!): Service!
    }
    type Mutation {
        # createProject(projectInput: ProjectInput): Project!
        # deleteProject(projectId: Id!): String!
        createServiceCat(title: String!): ServiceCat!
        editServiceCat(serviceCatId: ID!, serviceCatInput: ServiceCatInput!): ServiceCat!
        deleteServiceCat(serviceCatId: ID!): String!
        createService(serviceInput: ServiceInput!): Service!
        editService(serviceId: ID!, serviceInput: ServiceInput!): Service!
        deleteService(serviceId: ID!): String!
        register(registerInput: RegisterInput!): CurrentUser!
        login(emailOrUsername: String!, password: String!): CurrentUser!
        # logout(): String!
        # deleteAccount(): String!
    }
`;