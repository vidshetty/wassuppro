const mongoose = require("mongoose");

const LoggedInUserSchema = new mongoose.Schema({
    email: String,
    socketid: String,
    status:{
        type: String,
        default: "offline"
    },
    videocall: {
        type: String,
        default: "nostream"
    },
    subscription: {
        type: Array,
        default: []
    }
});

const LoggedInUsers = mongoose.model("loggedinuser",LoggedInUserSchema);
module.exports = LoggedInUsers;