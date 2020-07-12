const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    jwt: {
        type: String,
        default: ""
    }
});

const Users = mongoose.model("user",UserSchema);
module.exports = Users;