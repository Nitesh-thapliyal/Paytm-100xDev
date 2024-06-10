const mongoose  = require("mongoose");


// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: String,
    firstName: String,
    lastName: String
});


// creating model for userSchema
const User = mongoose.model('User', userSchema);

model.exports = {
    User
};