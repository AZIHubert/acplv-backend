const Project = require('../../models/Project');
const Type = require('../../models/Type');
const Image = require('../../models/Image');
const checkAuth = require('../../util/checkAuth');
const {transformProject} = require('../../util/merge');
const mongoose = require('mongoose');

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
                typeId,
                thumbnailId
            }
        }, context){
            const user = checkAuth(context)
            try{
                if(title.trim() === "" || title === undefined)
                    throw new Error('Title Can\'t be empty');
                let thumbnail;
                let type;
                if(thumbnailId !== undefined){
                    if (thumbnailId !== undefined && !thumbnailId.match(/^[0-9a-fA-F]{24}$/))
                        throw new Error('Invalid thumbnailId ObjectId');
                    thumbnail = await Image.findById(typeId);
                    if(!thumbnail) throw new Error('Thumbnail not found');
                }
                if(typeId !== undefined){
                    if (typeId !== undefined && !typeId.match(/^[0-9a-fA-F]{24}$/))
                        throw new Error('Invalid type ObjectId');
                    type = await Type.findById(typeId);
                    if(!type) throw new Error('Type not found');
                }
                let newProject = new Project({
                    title,
                    display,
                    index: 0,
                    createdAt: new Date().toISOString(),
                    createdBy: user._id,
                    type: typeId,
                    thumbnail: thumbnailId
                });
                
                await Project.updateMany({
                    $inc: {index: 1}
                });
                let project = await newProject.save();
                if(thumbnailId !== undefined){
                    thumbnail.projects.push(project._id);
                    await thumbnail.save();
                }
                if(typeId !== undefined){
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
                typeId,
                thumbnailId
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
                const oldThumbnail = project.thumbnail;
                if((title !== undefined && title === oldTitle) &&
                    (display !== undefined && display === oldDisplay) &&
                    ((typeId === undefined && oldType === null) ||
                    (typeId !== undefined && typeId === oldType)) &&
                    ((thumbnailId === undefined && oldThumbnail === null) ||
                    (thumbnailId !== undefined && thumbnailId === oldThumbnail)))
                    throw new Error('Project not changed');
                project.title = title !== undefined ? title : project.title;
                project.display = display !== undefined ? display : project.display;
                project.type = typeId !== undefined ? typeId : project.type;
                project.thumbnail = thumbnailId !== undefined ? thumnailId : project.thumbnail;
                project = await project.save();
                await Type.findByIdAndUpdate(oldType, {
                    $pull: {projects: mongoose.Types.ObjectId(projectId)}
                });
                await Type.findByIdAndUpdate(typeId, {
                    $push: {projects: projectId}
                });
                await Image.findByIdAndUpdate(oldType, {
                    $pull: {projects: mongoose.Types.ObjectId(projectId)}
                });
                await Image.findByIdAndUpdate(typeId, {
                    $push: {projects: projectId}
                });
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
                return 'Project successfully moved';
            } catch(err) {
                throw new Error(err);
            }
        },
        async deleteProject(_, {
            projectId
        }, context){
            checkAuth(context);
            try {
                if (projectId.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid ObjectId');
                const project = await Prohect.findById(projectId);
                if(!project) throw new Error('Project not found');
                const index = project.index;
                const typeId = project.type;
                const thumbnailId = project.thumbnail;
                await project.delete();
                await Project.updateMany({
                    index: {$gte: index}
                }, {
                    $inc: {index: -1}
                });
                await Type.findByIdAndUpdate(typeId, {
                    $pull: {projects: typeId}
                });
                await Image.findByIdAndUpdate(thumbnailId, {
                    $pull: {projects: typeId}
                });
                return 'ServiceCat deleted successfully';
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}