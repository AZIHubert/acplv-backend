const Type = require('../../models/Type');
const Project = require('../../models/Project');
const checkAuth = require('../../util/checkAuth');
const {transformType} = require('../../util/merge');
const { UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        async getTypes(){
            try{
                let types = await Type.find().sort({createdAt: 1});
                types = types.map(type => transformType(type));
                return types;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getUsedTypes(){
            try{
                let types = await Type.find({
                    projects: {$gt: []}
                });
                types = types.map(type => transformType(type));
                return types;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getType(_, {
            typeId
        }){
            try{
                if(!typeId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalide ObjectId');
                const type = await Type.findById(typeId);
                if(!type) throw new Error('Type not found');
                return transformType(type);
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createType(_, {
            title
        }, context){
            const user = checkAuth(context);
            if(title.trim() === '') throw new UserInputError('Errors', {
                errors: { title: 'Cant\'t be empty' }
            });
            let types;
            try{
                types = await Type.findOne({
                    title: {$regex: new RegExp(title, "i")}
                });
            } catch(err) {
                throw new Error(err);
            }
            if(types) throw new UserInputError('Errors', {
                errors: { title: 'Types already exist' }
            });
            try{
                const newType = new Type({
                    title,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id,
                    project: []
                });
                let type = await newType.save();
                return transformType(type);
            } catch(err){
                throw new Error(err);
            }
        },
        async editType(_, {
            typeId,
            title
        }, context){
            checkAuth(context);
            if(title.trim() === '') throw new UserInputError('Errors', {
                errors: { title: 'Cant\'t be empty' }
            });
            if(!typeId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
            let type;
            try{
                type = await Type.findById(typeId);
            } catch(err) {
                throw new Error(err)
            }
            if(!type) throw new Error('Type not found');
            let typeExist;
            try{
                typeExist = await Type.findOne({
                    $and: [
                        {"title": {$regex: new RegExp(title, "i")}},
                        {"_id": {$ne: typeId}}
                    ]
                });
            } catch(err){
                throw new Error(err);
            }
            if(typeExist) throw new UserInputError('Errors', {
                errors: { title: 'Type already exist' }
            });
            if(title === type.title) throw new UserInputError('Errors', {
                errors: { title: 'Type has not changed' }
            });
            type.title = title;
            try{
                await type.save();
                return transformType(type);
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteType(_, {
            typeId
        }, context){
            checkAuth(context);
            try{
                if(!typeId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const type = await Type.findById(typeId);
                if(!type) throw new Error('Type not found');
                await type.delete();
                await Project.updateMany({
                    type: { $eq: typeId }
                }, {
                    $set: {type: null}
                });
                return 'Type successfully deleted';
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}