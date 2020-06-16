const Client = require('../../models/Client');
const checkAuth = require('../../util/checkAuth');
const {userGetter} = require('../../util/merge');
const { UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        async getClients(){
            try {
                let clients = await Client.find().sort({index: 1});
                clients = clients.map(client => ({
                    ...client._doc,
                    _id: client._id,
                    createdBy: userGetter(client.createdBy)
                }));
                return clients;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getClient(_, {
            clientId
        }){
            try{
                if(!clientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                let client = await Client.findById(clientId);
                if(!client) throw new Error('Client not found');
                client = {
                    ...client._doc,
                    _id: client._id,
                    createdBy: userGetter(client.createdBy)
                };
                return client;
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createClient(_, {
            title
        }, context){
            const user = checkAuth(context);
            if(title.trim() === '') throw new UserInputError('Errors', {
                errors: { title: 'Cant\'t be empty' }
            });
            let clientExist;
            try {
                clientExist = await Client.findOne({
                    "title": {$regex: new RegExp(title, "i")}
                });
            } catch(err) {
                throw new Error(err)
            }
            if(clientExist) throw new UserInputError('Errors', {
                errors: { title: 'Client already exist' }
            });
            try{
                const newClient = new Client({
                    title,
                    index: 0,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id
                });
                await Client.updateMany({
                    $inc: {index: 1}
                });
                let client = await newClient.save();
                client = {
                    ...client._doc,
                    _id: client._id,
                    createdBy: userGetter(client.createdBy)
                }
                return client;
            } catch(err) {
                throw new Error(err);
            }
        },
        async editClient(_, {
            clientId,
            title
        }, context){
            checkAuth(context);
            if(title.trim() === '') throw new UserInputError('Errors', {
                errors: { title: 'Cant\'t be empty' }
            });
            let client;
            try{
                client = await Client.findById(clientId);
            } catch(err) {
                throw new Error(err);
            }
            if(!client) throw new Error('Client not found');
            let clientExist;
            try{
                clientExist = await Client.findOne({
                    $and: [
                        {"title": {$regex: new RegExp(title, "i")}},
                        {"_id": {$ne: clientId}}
                    ]
                });
            } catch(err) {
                throw new Error(err)
            }
            if(clientExist) throw new UserInputError('Errors', {
                errors: { title: 'Client already exist' }
            });
            if(title === client.title) throw new UserInputError('Errors', {
                errors: { title: 'Client has not changed' }
            });
            if (!clientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
            try{
                let clientEdited = await Client.findByIdAndUpdate(clientId, {
                    title
                }, {new: true});
                clientEdited = {
                    ...clientEdited._doc,
                    _id: clientEdited._id,
                    createdBy: userGetter(clientEdited.createdBy)
                }
                return clientEdited;
            } catch (err) {
                throw new Error(err);
            }
        },
        async moveClient(_, {
            clientId,
            index
        }, context){
            checkAuth(context);
            try{
                if (!clientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const clients = await Client.find();
                let client = await Client.findById(clientId);
                if(!client) throw new Error('Client not found');
                if(index < 0 || index > clients.length - 1) throw new Error('Index out of range');
                let oldIndex = client.index;
                client.index = index;
                await Client.updateMany({
                    $and: [
                        {_id: {$ne: clientId}},
                        {index: {$gte: oldIndex}}
                    ]
                }, {
                    $inc: {index: -1}
                });
                await Client.updateMany({
                    $and: [
                        {_id: {$ne: clientId}},
                        {index: {$gte: index}}
                    ]
                }, {
                    $inc: {index: 1}
                });
                await client.save();
                // let editedClients = await Client.find().sort({index: 1});
                // editedClients = editedClients.map(client => ({
                //     ...client._doc,
                //     _id: client._id,
                //     createdBy: userGetter(client.createdBy)
                // }));
                return 'test'
                return editedClients;
            } catch (err) {
                throw new Error(err);
            }
        },
        async deleteClient(_, {
            clientId
        }, context){
            checkAuth(context);
            try {
                if (!clientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const client = await Client.findById(clientId);
                if(!client) throw new Error('Client not found');
                const index = client.index;
                await client.delete();
                await Client.updateMany({
                    index: {$gte: index}
                }, {
                    $inc: {index: -1}
                });
                return 'Client deleted successfully';
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}