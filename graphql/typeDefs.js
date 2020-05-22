const {
    gql
} = require('apollo-server');

module.exports = gql`
    type Project {
        _id: ID!
        title: String!
        index: Int!
        display: Boolean!
        type: Type
        username: ID
        createdAt: String!
        thumbnailUrl: Image
    }
    type Type {
        _id: ID!
        title: String
    }
    type Client {
        _id: ID!
        title: String!
        index: Int!
        createdAt: String!
        createdBy: User
    }
    type ServiceCat {
        _id: ID!
        title: String!
        index: Int!
        createdBy: User
        createdAt: String!
    }
    type Service {
        _id: ID!
        title: String!
        index: Int!
        createdAt: String!
        createdBy: User
        serviceCat: ServiceCat
    }
    type Image {
        _id: ID!
        filename: String!
        format: String!
        folder: String!
        url: String!
        uploadAt: String!
        uploadBy: User!
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
    input ServiceInput {
        title: String!
        serviceCatId: ID
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
        # getTypes: [Type]!
        # getType(typeId: ID!): Type!
        getImages: [Image]!
        getImage(imageId: ID!): Image!
        getClients: [Client]!
        getClient(clientId: ID!): Client!
        getServiceCats: [ServiceCat]!
        getServiceCat(serviceCatId: ID!): ServiceCat!
        getServices: [Service]!
        getServicesByCat(serviceCatId: ID!): [Service]!
        getService(serviceId: ID!): Service!
    }
    type Mutation {
        # createType(title: String): Type!
        # editType(typeId: ID!, title: String): Type!
        # deleteType(typeId: ID!): String!
        # createProject(projectInput: ProjectInput!): Project!
        # editProject(projectId: ID!, projectInput: ProjectInput!): Project!
        # deleteProject(projectId: Id!): String!
        uploadImage(imageFile: Upload!, folder: String!): Image!
        deleteImage(imageId: ID): String!
        createClient(title: String): Client!
        editClient(clientId: ID!, title: String): Client!
        deleteClient(clientId: ID!): String!
        createServiceCat(title: String!): ServiceCat!
        editServiceCat(serviceCatId: ID!, title: String!): ServiceCat!
        deleteServiceCat(serviceCatId: ID!): String!
        createService(serviceInput: ServiceInput!): Service!
        editService(serviceId: ID!, serviceInput: ServiceInput!): Service!
        deleteService(serviceId: ID!): String!
        register(registerInput: RegisterInput!): CurrentUser!
        login(emailOrUsername: String!, password: String!): CurrentUser!
        # editUser(userInput: userInput): User!
        # logout(): String!
        # deleteAccount(): String!
    }
`;

// TODO: Change type Image by Thumbnail (to create specific route to upload image)