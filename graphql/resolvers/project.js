const Project = require('../../models/Project');
const Type = require('../../models/Type');
const checkAuth = require('../../util/checkAuth');
const {transformProject} = require('../../util/merge');
const mongoose = require('mongoose');
const { UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        async getProjects(){
            try{
                let projects = await Project.find()
                    .sort({index: 1});
                projects = projects.map(project => transformProject(project));
                return projects;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getProject(_, {
            projectId
        }){
            try{
                if (!projectId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                let project = await Project.findById(projectId);
                if(project) throw new Error('Project not found');
                return transformProject(project);
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createProject(_, {
            projectInput: {
                title,
                display,
                typeId
            }
        }, context){
            const user = checkAuth(context)
            if(title.trim() === '') throw new UserInputError('Errors', {
                errors: { title: 'Cant\'t be empty' }
            });
            let projects;
            try{
                projects = await Project.findOne({
                    title: {$regex: new RegExp(title, "i")}
                });
            } catch(err) {
                throw new Error(err);
            }
            if(projects) throw new UserInputError('Errors', {
                errors: { title: 'Types already exist' }
            });
            let type;
            try{
                if(typeId !== undefined && typeId.trim() !== ""){
                    if (typeId !== undefined && !typeId.match(/^[0-9a-fA-F]{24}$/))
                        throw new Error('Invalid type ObjectId');
                    type = await Type.findById(typeId);
                    if(!type) throw new Error('Type not found');
                } else {
                    typeId = null
                }
                let newProject = new Project({
                    title,
                    display,
                    index: 0,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id,
                    type: typeId,
                    thumbnail: null
                });
                
                await Project.updateMany({
                    $inc: {index: 1}
                });
                let project = await newProject.save();
                if(typeId !== null){
                    type.projects.push(project._id);
                    await type.save();
                }
                return transformProject(project);
            } catch(err) {
                throw new Error(err);
            }
        },
        async editProject(_, {
            projectId,
            projectInput: {
                title,
                display,
                typeId
            }
        }, context){
            checkAuth(context);
            try{
                if (!projectId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid service ObjectId');
                let project = await Project.findById(projectId);
                if(!project) throw new Error('Service not found');
                const oldTitle = project.title;
                const oldDisplay = project.display;
                const oldType = project.type;
                typeId = typeId === '' ? null : typeId;
                project.title = (title !== undefined && title.trim !== '') ? title : project.title;
                project.display = display !== undefined ? display : project.display;
                project.type = typeId;
                project = await project.save();
                if(oldType){
                    await Type.findByIdAndUpdate(oldType, {
                        $pull: {projects: mongoose.Types.ObjectId(projectId)}
                    });
                }
                if(project.type){
                    await Type.findByIdAndUpdate(typeId, {
                        $push: {projects: projectId}
                    });
                }
                return transformProject(project);
            } catch(err) {
                throw new Error(err);
            }
        },
        async moveProject(_, {
            projectId,
            index
        }, context){
            checkAuth(context);
            try{
                if (!projectId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid project ObjectId');
                const projects = await Project.find();
                let project = await Project.findById(projectId);
                if(!project) throw new Error('Project not found');
                if(index < 0 || index > projects.length - 1) throw new Error('Index out of range');
                let oldIndex = project.index;
                project.index = index;
                await Project.updateMany({
                    $and: [
                        {_id: {$ne: projectId}},
                        {index: {$gte: oldIndex}}
                    ]
                }, {
                    $inc: {index: -1}
                });
                await Project.updateMany({
                    $and: [
                        {_id: {$ne: projectId}},
                        {index: {$gte: index}}
                    ]
                }, {
                    $inc: {index: 1}
                });
                await project.save();
                let projects = await Project.find()
                    .sort({index: 1});
                projects = projects.map(project => transformProject(project));
                return projects;
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteProject(_, {
            projectId
        }, context){
            checkAuth(context);
            try {
                if (!projectId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const project = await Project.findById(projectId);
                if(!project) throw new Error('Project not found');
                const index = project.index;
                const typeId = project.type ? project.type._id : '';
                const thumbnailId = project.thumbnail ? project.thumbnail._id : '';
                await project.delete();
                await Project.updateMany({
                    index: {$gte: index}
                }, {
                    $inc: {index: -1}
                });
                if(project.type){
                    await Type.findByIdAndUpdate(project.type._id, {
                        $pull: {projects: projectId}
                    });
                }
                return 'ServiceCat deleted successfully';
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}