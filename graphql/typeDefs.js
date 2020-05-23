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
        createdBy: User!
        createdAt: String!
        thumbnailUrl: Image
    }
    type Type {
        _id: ID!
        title: String!
        createdAt: String!
        createdBy: User!
        projects: [Project]!
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
        services: [Service]!
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
        type: String!
        url: String!
        uploadAt: String!
        uploadBy: User!
        project: [Project]!
        isFavicon: Boolean!
        isLogo: Boolean!
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
        title: String
        display: Boolean!
        typeId: ID
        thumbnailId: ID
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
        registerConfirmation: String!
    }
    input EmailInput {
        email: String!
        firstName: String!
        lastName: String!
        company: String!
        phone: String!
        body: String!
    }
    type Query {
        getProjects: [Project]!
        getProject(projectId: ID!): Project!
        getTypes: [Type]!
        getType(typeId: ID!): Type!
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
        createProject(projectInput: ProjectInput!): Project!
        editProject(projectId: ID!, projectInput: ProjectInput!): Project!
        moveProject(projectId: ID!, index: String!): String!
        deleteProject(projectId: ID!): String!
        createType(title: String!): Type!
        editType(typeId: ID!, title: String!): Type!
        deleteType(typeId: ID!): String!
        uploadImage(imageFile: Upload!, type: String): Image!
        deleteImage(imageId: ID): String!
        createClient(title: String): Client!
        editClient(clientId: ID!, title: String): Client!
        moveClient(clientId: ID!, index: Int!): String!
        deleteClient(clientId: ID!): String!
        createServiceCat(title: String!): ServiceCat!
        editServiceCat(serviceCatId: ID!, title: String!): ServiceCat!
        moveServiceCat(serviceCatId: ID!, index: Int!): String!
        deleteServiceCat(serviceCatId: ID!): String!
        createService(title: String! serviceCatId: ID): Service!
        editService(serviceId: ID!, title: String!): Service!
        moveService(serviceId: ID! index: Int! serviceCatId: ID): String!
        deleteService(serviceId: ID!): String!
        register(registerInput: RegisterInput!): CurrentUser!
        login(emailOrUsername: String!, password: String!): CurrentUser!
        # editUser(userInput: userInput): User!
        # logout(): String!
        # deleteAccount(): String!
        # sendEmail(emailInput: EmailInput!): String!
    }
`;
