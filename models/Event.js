const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const attractionsSchema = new Schema({
    image: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    }
})

const eventSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    banner: {
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true
    },
    location:{
        type: String,
        require: true
    },
    attracitons:{
        type: [attractionsSchema]
    },
    visible:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;