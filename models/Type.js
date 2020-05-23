const {
    model, Schema
} = require('mongoose');

const typeSchema = new Schema({
    title: String,
    createdAt: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }]
});

module.exports = model('Type', typeSchema);