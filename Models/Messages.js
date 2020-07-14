const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    users: {
        type: Array,
        default: null
    },
    msg: {
        type: Array,
        default: null
    }
});

const Messages = mongoose.model("message",MessageSchema);
module.exports = Messages;