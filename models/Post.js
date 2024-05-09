const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    description:{
        type: String,
        default: ""
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    likes:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    comments:{
        type: [commentSchema],
        default: []
    },
    visible:{
        type: Boolean,
        default: true
    }
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;