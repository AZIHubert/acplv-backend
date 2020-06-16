const {
    gql
} = require('apollo-server-express');

module.exports = gql`
    type General {
        primaryColor: String!
        secondaryColor: String!
        tertiaryColor: String!
        email: String
        phone: String
        about: String
        whoAreWeFirst: String
        whoAreWeSecond: String
        facebookLink: String
        instagramLink: String
        linkedinLink: String
        adressStreet: String
        adressCity: String
    }
    type Project {
        _id: ID!
        title: String!
        index: Int!
        display: Boolean!
        type: Type
        createdBy: User!
        createdAt: String!
        thumbnail: Image
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
        url: String!
        uploadAt: String!
        uploadBy: User!
        project: Project!
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
    input GeneralInput {
        primaryColor: String
        secondaryColor: String
        tertiaryColor: String
        email: String
        phone: String
        about: String
        whoAreWeFirst: String
        whoAreWeSecond: String
        facebookLink: String
        instagramLink: String
        linkedinLink: String
        adressStreet: String
        adressCity: String
    }
    input SocialNetworkInput {
        isActive: Boolean!,
        link: String!
    }
    input ProjectInput {
        title: String
        display: Boolean!
        typeId: ID
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
        company: String
        phone: String
        subject: String!
        body: String!
    }
    type Query {
        getGeneral: General!
        getProjects: [Project]!
        getProject(projectId: ID!): Project!
        getTypes: [Type]!
        getUsedTypes: [Type]!
        getType(typeId: ID!): Type!
        getImages: [Image]!
        getImage(imageId: ID!): Image!
        getClients: [Client]!
        getClient(clientId: ID!): Client!
        getServiceCats: [ServiceCat]!
        getServiceCatsWithServices: [ServiceCat]!
        getServiceCat(serviceCatId: ID!): ServiceCat!
        getServices: [Service]!
        getServicesByCat(serviceCatId: ID!): [Service]!
        getService(serviceId: ID!): Service!
    }
    type Mutation {
        editGeneral(generalInput: GeneralInput): General!
        createProject(projectInput: ProjectInput!): Project!
        editProject(projectId: ID!, projectInput: ProjectInput!): Project!
        moveProject(projectId: ID!, index: Int!): [Project]!
        deleteProject(projectId: ID!): String!
        createType(title: String!): Type!
        editType(typeId: ID!, title: String!): Type!
        deleteType(typeId: ID!): String!
        uploadImage(imageFile: Upload!, projectId: ID!): Image!
        deleteImage(imageId: ID): String!
        createClient(title: String): Client!
        editClient(clientId: ID!, title: String): Client!
        moveClient(clientId: ID!, index: Int!): [Client]!
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
        sendEmail(emailInput: EmailInput!): String!
    }
`;
