const mongoose = require('mongoose');
require("dotenv").config()

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  profilePicture: {
    type: String,
    default: `${process.env.S3_URL}default.png`
  },
  bio: {
    type: String,
    default: ""
  },
  posts: {
    type: [{type:Schema.Types.ObjectId, ref: 'Post'}],
    default: []
  },
  eventAttended: {
    type: [{type:Schema.Types.ObjectId, ref: 'Event'}],
    default: []
  },
  followers: {
    type: [{type:Schema.Types.ObjectId, ref: 'Follower'}],
    default: []
  },
  following: {
    type: [{type:Schema.Types.ObjectId, ref: 'Following'}],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;