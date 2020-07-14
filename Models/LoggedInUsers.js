const mongoose = require("mongoose");

const LoggedInUserSchema = new mongoose.Schema({
    email: String,
    socketid: String,
    status:{
        type: String,
        default: "offline"
    }
});

const LoggedInUsers = mongoose.model("loggedinuser",LoggedInUserSchema);
module.exports = LoggedInUsers;