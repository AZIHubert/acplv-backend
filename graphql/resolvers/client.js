const Client = require('../../models/Client');
const checkAuth = require('../../util/checkAuth');
const {userGetter} = require('../../util/merge');

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
            try {
                if(title.trim() === '') throw new Error('Can\'t be empty');
                const clientExist = await Client.findOne({
                    "title": {$regex: new RegExp(title, "i")}
                });
                if(clientExist) throw new Error('Client already exist');
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
            try{
                if(title.trim() === '') throw new Error('Can\'t be empty');
                const client = await Client.findById(clientId);
                if(!client) throw new Error('Client not found');
                const clientExist = await Client.findOne({
                    $and: [
                        {"title": {$regex: new RegExp(title, "i")}},
                        {"_id": {$ne: clientId}}
                    ]
                });
                if(clientExist) throw new Error('Client already exist');
                if (clientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                if(title !== client.title) throw new Error('Client has not changed');
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
                return 'Client move successfully'
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