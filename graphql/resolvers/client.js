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
                if(clientId.match(/^[0-9a-fA-F]{24}$/)) {
                    let client = await Client.findById(clientId);
                    if(client){
                        client = {
                            ...client._doc,
                            _id: client._id,
                            createdBy: userGetter(client.createdBy)
                        };
                        return client;
                    } else throw new Error('Client not found');
                } else throw new Error('Invalid ObjectId')
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
                const clientExist = await Client.findOne({
                    "title": {$regex: new RegExp(title, "i")}
                });
                if(clientExist){
                    throw new Error('Client already exist');
                }
                const clients = await Client.find();
                const newClient = new Client({
                    title,
                    index: clients.length,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id
                });
                console.log(new Date().toISOString());
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
                const client = await Client.findById(clientId);
                if(!client){
                    throw new Error('Client not found');
                }
                const clientExist = await Client.findOne({
                    $and: [
                        {"title": {$regex: new RegExp(title, "i")}},
                        {"_id": {$ne: clientId}}
                    ]
                });
                if(clientExist){
                    throw new Error('Client already exist');
                }
                if (clientId.match(/^[0-9a-fA-F]{24}$/)) {
                    if(title !== client.title){
                        let clientEdited = await Client.findByIdAndUpdate(clientId, {
                            title
                        }, {new: true});
                        clientEdited = {
                            ...clientEdited._doc,
                            _id: clientEdited._id,
                            createdBy: userGetter(clientEdited.createdBy)
                        }
                        return clientEdited;
                    } else throw new Error('Client has not changed');
                } else throw new Error('Invalid ObjectId');
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
                if(index < 0 || index > clients.length) throw new Error('Index out of range');
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
                if (clientId.match(/^[0-9a-fA-F]{24}$/)) {
                    const client = await Client.findById(clientId);
                    if(client){
                        const index = client.index;
                        await client.delete();
                        await Client.updateMany({
                            index: {$gte: index}
                        }, {
                            $inc: {index: -1}
                        });
                    } else throw new Error('Client not found');
                    return 'Client deleted successfully';
                } else throw new Error('Invalid ObjectId');
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}