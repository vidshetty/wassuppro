const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    jwt: {
        type: String,
        default: ""
    },
    chats: {
        type: Array,
        default: null
    }
});

const Users = mongoose.model("user",UserSchema);
module.exports = Users;