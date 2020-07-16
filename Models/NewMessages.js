const mongoose = require("mongoose");

const NewMessageSchema = new mongoose.Schema({
    fromname: String,
    from: String,
    to: String,
    messages: {
        type: Array,
        default: []
    }
});

const NewMessages = mongoose.model("newmessage",NewMessageSchema);
module.exports = NewMessages;