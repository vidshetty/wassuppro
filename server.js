const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");
const io = socket(server);
const mongoose = require("mongoose");
const Users = require("./Models/Users");
const Messages = require("./Models/Messages");
const NewMessages = require("./Models/NewMessages");
const LoggedInUsers = require("./Models/LoggedInUsers");
const nodemailer = require("nodemailer");
const { v4:uuidv4 } = require("uuid");
var push = require("web-push");
const PORT = process.env.PORT || 8000;
var randomotp = 0;
var account = [];

var keys = {
    publicKey: 'BEcF57uMF5LyK9boqYxf-9q21GdcWX707xxPz-MWieIhCI4lwBCgP9xtxWeYq632HaR0b9mwI9GW1dxs6r2zoV0',
    privateKey: 'PE4b8oi4JZyIqcCh6yFAt7uU_flRI7_of8nbKVkPgBE'
}

push.setVapidDetails("mailto:test@test.com",keys.publicKey,keys.privateKey);

mongoose.connect("mongodb+srv://vid_shetty:itsmemongodb1998@tictactoe.jfyxk.mongodb.net/wassup?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.connection.once("open",() => {
    console.log("Database connected");
});
mongoose.connection.on("error",() => {
    console.log("error");
});

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

var generateotp = () => {
    return parseInt((Math.random() * 10) * 1000000);
}

var addmsg = (doc,data) => {
    var objt = {
        email: data.sender,
        msg: data.message
    };
    doc.msg.push(objt);
    Messages.findOneAndUpdate({users: doc.users},{msg: doc.msg},{new:true}).then(result => {
    });
}

var createmsg = (data) => {
    var objt = {
        email: data.sender,
        msg: data.message
    };
    var arr = [];
    var user = [];
    user.push(data.sender);
    user.push(data.receiver);
    arr.push(objt);
    var newmsg = new Messages({
        users: user,
        msg: arr
    });
    newmsg.save().then(() => {
    });
}


var findnewMessage = (num,data,socket) => {
    if(num == 1){
        NewMessages.findOne({to: data.receiver,from:data.sender}).then(doc => {
            if(doc != null){
                var rarr = [];
                var rarr = doc.messages;
                rarr.push(data.message);
                NewMessages.findOneAndUpdate({to: data.receiver,from:data.sender},{messages: rarr},{new:true}).then(result => {
                    socket.emit("confirm",{
                        val: "receiver's",
                        no: 1
                    });
                    // LoggedInUsers.findOne({email: data.from}).then(res => {
                    //     io.to(res.socketid).emit("confirm",{
                    //         val: "sender's"
                    //     });
                    // });
                });
            }
            else{
                var rarr = [];
                rarr.push(data.message);
                Users.findOne({email: data.sender}).then(thisdoc => {
                    var newm = new NewMessages({
                        fromname: thisdoc.username,
                        from: data.sender,
                        to: data.receiver,
                        messages: rarr
                    });
                    newm.save().then((result) => {
                        socket.emit("confirm",{
                            val: "receiver's",
                            no: 1
                        });
                        // LoggedInUsers.findOne({email: data.from}).then(res => {
                        //     io.to(res.socketid).emit("confirm",{
                        //         val: "sender's"
                        //     });
                        // });
                    });
                });
            }
        });
    }
    else{
        NewMessages.findOne({to: data.to,from: data.from}).then(doc => {
            if(doc != null){
                var rarr = doc.messages;
                rarr.push(data.msg);
                NewMessages.findOneAndUpdate({to: data.to,from:data.from},{messages: rarr},{new:true}).then(result => {
                    socket.emit("confirm",{
                        val: "receiver's",
                        no: 0
                    });
                    LoggedInUsers.findOne({email: data.from}).then(res => {
                        io.to(res.socketid).emit("confirm",{
                            val: "sender's"
                        });
                    });
                });
            }
            else{
                var rarr = [];
                rarr.push(data.msg);
                Users.findOne({email: data.from}).then(thisdoc => {
                    var newm = new NewMessages({
                        fromname: thisdoc.username,
                        from: data.from,
                        to: data.to,
                        messages: rarr
                    });
                    newm.save().then((result) => {
                        socket.emit("confirm",{
                            val: "receiver's",
                            no: 0
                        });
                        LoggedInUsers.findOne({email: data.from}).then(res => {
                            io.to(res.socketid).emit("confirm",{
                                val: "sender's"
                            });
                        });
                    });
                });
            }
        });
    }
}

var mailer = (req) => {
    randomotp = generateotp();
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: 'wassupnode@gmail.com',
    //       pass: 'itsmeWASSUP@1998'
    //     }
    // });
      
    // var mailOptions = {
    //     from: 'wassupnode@gmail.com',
    //     to: req.body.email,
    //     subject: 'Verification mail from Wassup!',
    //     text: `Your verification password is "${randomotp}". Do not reply or forward this mail.` 
    // };
      
    // transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent:');
    //     }
    // });
}

io.on("connection",socket => {
    socket.on("initial",data => {
        LoggedInUsers.findOneAndUpdate({email: data.email},{socketid: socket.id,status: "online"},{new:true}).then((doc) => {
            socket.broadcast.emit("statusres",{
                email: doc.email,
                status: doc.status
            });
        });
    });

    socket.on("sendmsg",data => {
        var counter = 1;
        Messages.find().then(docs => {
            for(var i=0;i<docs.length;i++){
                if(data.sender == docs[i].users[0] || data.sender == docs[i].users[1]){
                    if(data.receiver == docs[i].users[0] || data.receiver == docs[i].users[1]){
                        counter = 2;
                        addmsg(docs[i],data);
                    }
                }
            };
            if(counter == 1){
                createmsg(data);
            }    
        });
        LoggedInUsers.findOne({email: data.receiver}).then(doc => {
            if(doc.status == "online"){
                io.to(doc.socketid).emit("livemsg",{
                    msg: data.message,
                    sender: data.sender
                });
            }
            else{
                findnewMessage(1,data,socket);
            }
        });
    });

    socket.on("notify",data => {
        LoggedInUsers.findOne({email: data.receiver}).then(doc => {
            if(doc.status == "offline"){
                NewMessages.findOne({from: data.sender,to: data.receiver}).then(result => {
                    var payload = JSON.stringify({
                        title: data.sendername,
                        sender: data.sender,
                        receiver: data.receiver,
                        body: result.messages,
                        type: "text",
                        msg: data.message
                    });
                    var subscription = JSON.parse(doc.subscription[0]);
                    push.sendNotification(subscription,payload);
                    var newnotify = doc.textnotification;
                    newnotify.push(data.sender);
                    LoggedInUsers.findOneAndUpdate({email: data.receiver},{textnotification: newnotify},{new:true})
                    .then(() => {});
                });
            }
            else{
                if(doc.videocall == "streaming"){
                    NewMessages.findOne({from: data.sender,to: data.receiver}).then(result => {
                        var payload = JSON.stringify({
                            title: data.sendername,
                            body: result.messages,
                            type: "text",
                            msg: data.message,
                            streaming: "true"
                        });
                        var subscription = JSON.parse(doc.subscription[0]);
                        push.sendNotification(subscription,payload);
                        var newnotify = doc.textnotification;
                        newnotify.push(data.sender);
                        LoggedInUsers.findOneAndUpdate({email: data.receiver},{textnotification: newnotify},{new:true})
                        .then(() => {});
                    });
                }
            }
        });
    });

    socket.on("addingnewmsg",data => {
        findnewMessage(-1,data,socket);
    });

    socket.on("typing?",data => {
        LoggedInUsers.findOne({email: data.receiver}).then(doc => {
            if(data.val == "typing"){
                io.to(doc.socketid).emit("typingyes",{
                    sender: data.sender,
                    receiver: doc.email,
                    data: "yes"
                });
            }
            else{
                io.to(doc.socketid).emit("typingyes",{
                    sender: data.sender,
                    receiver: doc.email,
                    data: "no"
                });
            }
        });
    });

    socket.on("delete",data => {
        LoggedInUsers.findOneAndUpdate({email: data.email},{loginsocketid: ""},{new:true}).then(() => {
        });
    });

    socket.on("statusreq",data => {
        LoggedInUsers.findOne({email: data.email}).then(doc => {
            socket.emit("statusres",{
                email: doc.email,
                status: doc.status
            });
        });
    });

    socket.on("clear",data => {
        NewMessages.findOneAndDelete({from: data.from,to: data.to}).then(result => {
            socket.emit("cleared",{
                res: "cleared"
            });
        });
    });

    socket.on("callreq",data => {
        LoggedInUsers.findOne({email: data.receiver}).then(result => {
            if(result.status == "online"){
                io.to(result.socketid).emit("callreq",{
                    req: data.req,
                    caller: data.caller,
                    callername: data.callername,
                    receiver: data.receiver
                });
            }
            else{
                var counter = 0;
                for(var i=0;i<result.videonotification.length;i++){
                    if(result.videonotification[i] == data.caller){
                        counter += 1;
                    }
                }
                if(counter == 0){
                    var newarr = result.videonotification;
                    newarr.push(data.caller);
                    var payload = JSON.stringify({
                        title: data.callername,
                        type: "video"
                    });
                    var subscription = JSON.parse(result.subscription[0]);
                    push.sendNotification(subscription,payload);
                    LoggedInUsers.findOneAndUpdate({email:data.receiver},{videonotification: newarr},{new:true}).then(()=>{});
                }
                socket.emit("callrequest",{
                    req: -1
                });
            }
        });
    });

    socket.on("callres",data => {
        LoggedInUsers.findOne({email: data.caller}).then(result => {
            io.to(result.socketid).emit("callres",{
                res: data.res,
                callername: data.callername,
                peerid: data.peerid,
                caller: data.caller,
                receiver: data.receiver
            });
        });
    });

    socket.on("left",data => {
        if(data.left == "caller"){
            LoggedInUsers.findOne({email: data.receiver}).then(result => {
                io.to(result.socketid).emit("left",{
                    left: "caller",
                    caller: data.caller,
                    receiver: data.receiver
                });
            });
        }
        else{
            LoggedInUsers.findOne({email: data.caller}).then(result => {
                io.to(result.socketid).emit("left",{
                    left: "receiver",
                    caller: data.caller,
                    receiver: data.receiver
                });
            });
        }
    });

    socket.on("setstream",data => {
        LoggedInUsers.findOneAndUpdate({email: data.email},{videocall: "nostream"}).then(() => {});
    });

    socket.on("interrupt",data => {
        LoggedInUsers.findOne({email: data.receiver}).then(doc => {
            if(doc.videocall == "streaming"){
                var counter = 0;
                for(var i=0;i<doc.videonotification.length;i++){
                    if(doc.videonotification[i] == data.caller){
                        counter += 1;
                    }
                }
                if(counter == 0){
                    var newarr = [];
                    newarr = doc.videonotification;
                    newarr.push(data.sender);
                    var payload = JSON.stringify({
                        title: data.sendername,
                        type: "video"
                    });
                    var subscription = JSON.parse(doc.subscription[0]);
                    push.sendNotification(subscription,payload);
                    LoggedInUsers.findOneAndUpdate({email:data.receiver},{videonotification: newarr},{new:true}).then(()=>{});
                }
                socket.emit("interruptres",{
                    res: "busy"
                });
            }
            else{
                socket.emit("interruptres",{
                    res: "go ahead"
                });
            }
        });
    });

    socket.on("videocall",data => {
        if(data.call == 1){
            LoggedInUsers.findOneAndUpdate({email: data.email},{videocall: "streaming"}).then(() => {});
        }
        else{
            LoggedInUsers.findOneAndUpdate({email: data.email},{videocall: "nostream"}).then(() => {});
        }
    });

    socket.on("seen",data => {
        LoggedInUsers.findOne({email: data.from}).then(doc => {
            io.to(doc.socketid).emit("seen",{
                seen: "true",
                from: data.from,
                to: data.to
            });
        })
    });

    socket.on("isseen",data => {
        NewMessages.findOne({from: data.from,to: data.to}).then(doc => {
            if(doc == null){
                socket.emit("seen",{
                    seen: "true",
                    from: data.from,
                    to: data.to
                });
            }
        })
    });

    socket.on("onconnect",data => {
        LoggedInUsers.findOneAndUpdate({email: data.email},{status: "online",socketid: socket.id,textnotification: [],videonotification:[]},{new:true}).then(doc => {
            socket.broadcast.emit("statusres",{
                email: doc.email,
                status: doc.status
            });
        });
    });

    socket.on("disconnect",() => {
        LoggedInUsers.findOneAndUpdate({socketid: socket.id},{status: "offline"},{new:true}).then((doc) => {
            socket.broadcast.emit("statusres",{
                email: doc.email,
                status: doc.status
            });
        }).catch(err => console.log(err.message));
    });
});

app.post("/shownewmsgs",(req,res) => {
    NewMessages.findOne({from: req.body.from,to: req.body.to}).then(doc => {
        if(doc != null){
            res.send(doc.messages);
        }
        else{
            res.send([]);
        }
    });
});

app.post("/login",(req,res) => {
    email = req.body.email;
    Users.findOne({email: req.body.email}).then((doc) => {
        if(doc != null){
            mailer(req);
            console.log("loginotp "+randomotp);
            res.send("otp");
        }
        else{
            res.send("fail");
        }
    });
});

app.post("/signup",(req,res) => {
    username = req.body.username;
    email = req.body.email;
    Users.findOne({email: req.body.email}).then((doc) => {
        if(doc == null){
            mailer(req);
            console.log(randomotp);
            res.send("otp");
        }
        else{
            res.send("fail");
        }
    });
});

app.post("/otp",(req,res) => {
    if(randomotp == req.body.otp){
        Users.findOne({email: req.body.email}).then((doc) => {
            if(doc != null){
                LoggedInUsers.findOne({email: req.body.email}).then((docs) => {
                    if(docs == null){
                        var loggedinuser = new LoggedInUsers({
                            email: email,
                            socketid: ""
                        });
                        loggedinuser.save().then((result) => {
                        }); 
                    }
                });
                var jwt = uuidv4();
                Users.findOneAndUpdate({email: email},{jwt: jwt}).then((docu) => {
                });
                res.send({
                    msg: "success",
                    token: jwt
                });
            }
            else{
                LoggedInUsers.findOne({email: req.body.email}).then((docs) => {
                    if(docs == null){
                        var loggedinuser = new LoggedInUsers({
                            email: email,
                            socketid: ""
                        });
                        loggedinuser.save().then((result) => {
                        }); 
                    }
                });
                var user = new Users({
                    username: username,
                    email: email
                });
                user.save().then((result) => {
                    res.send("success");
                });
            }
            randomotp = 0;
        });
    }
    else{
        res.send("invalid");
    }
});

app.post("/getusercred",(req,res) => {
    Users.findOne({jwt: req.body.data}).then(result => {
        if(result == null){
            res.send({
                email: "not matching"
            });
        }
        else{
            res.send({
                name: result.username,
                email: result.email
            });
        }
    }).catch(err => console.log(err.message));
});

app.post("/searchuser",(req,res) => {
    Users.find({jwt: {$ne:req.body.token}}).then(result => {
        if(result != null){
            for(var i=0;i<result.length;i++){
                if(result[i].username.startsWith(req.body.data) == true){
                    var obj = {
                        name: result[i].username,
                        email: result[i].email
                    };
                    account.push(obj);
                }
                else if(result[i].email.startsWith(req.body.data) == true){
                    var obj = {
                        name: result[i].username,
                        email: result[i].email
                    };
                    account.push(obj);
                }
            };
            if(account.length == 0){
                res.send({ arr: "not found"});
                account = [];
            }
            else{
                res.send({
                    arr: account
                });
                account = [];
            }
        }
        else{
            res.send({ arr: "not found"});
        }
    });
});


app.post("/retrievechats",(req,res) => {
    Messages.find().then(docs => {
        var counter = 0;
        for(var i=0;i<docs.length;i++){
            if((docs[i].users[0] == req.body.sender && docs[i].users[1] == req.body.receiver) || (docs[i].users[0] == req.body.receiver && docs[i].users[1] == req.body.sender)){
                res.send({chats: docs[i].msg});
                counter += 1;                
            }
        };
        if(counter == 0){
            res.send({chats: "no chats"});
        }
    }).catch(err => console.log("ignore"));
});

app.post("/onlinestatus",(req,res) => {
    LoggedInUsers.findOne({email: req.body.email}).then(doc => {
        res.send(doc);
    });
});

app.post("/trial",(req,res) => {
    var emails = [];
    var mainarr = [];
    NewMessages.find({to: req.body.data}).then(docs => {
        if(docs.length != 0){
            for(var i=0;i<docs.length;i++){
                var objt = {
                    val: 1,
                    name: docs[i].fromname,
                    email: docs[i].from,
                    len: docs[i].messages.length
                };
                mainarr.push(objt);
            }
            Messages.find().then(docs => {
                for(var i=0;i<docs.length;i++){
                    if(req.body.data == docs[i].users[0]){
                        var c = 0;
                        for(var j=0;j<mainarr.length;j++){
                            if(docs[i].users[1] != mainarr[j].email){
                                c++;
                            }
                        }
                        if(c == mainarr.length){
                            emails.push(docs[i].users[1]);
                        }
                    }
                    if(req.body.data == docs[i].users[1]){
                        var c = 0;
                        for(var j=0;j<mainarr.length;j++){
                            if(docs[i].users[0] != mainarr[j].email){
                                c++;
                            }
                        }
                        if(c == mainarr.length){
                            emails.push(docs[i].users[0]);
                        }
                    }
                };
                if(emails.length > 0){
                    var counter = 0;
                    for(var i=0;i<emails.length;i++){
                        Users.findOne({email: emails[i]}).then(result => {
                            var objt = {
                                val: -1,
                                name: result.username,
                                email: result.email
                            };
                            mainarr.push(objt);
                            counter++;
                            if(counter == emails.length){
                                res.send(mainarr);
                            }
                        });
                    };      
                }
                else{
                    res.send(mainarr);
                }
            });
        }
        else{
            Messages.find().then(docs => {
                for(var i=0;i<docs.length;i++){
                    if(req.body.data == docs[i].users[0]){
                        emails.push(docs[i].users[1]);
                    }
                    if(req.body.data == docs[i].users[1]){
                        emails.push(docs[i].users[0]);
                    }
                };
                if(emails.length > 0){
                    var counter = 0;
                    for(var i=0;i<emails.length;i++){
                        Users.findOne({email: emails[i]}).then(result => {
                            var objt = {
                                val: -1,
                                name: result.username,
                                email: result.email
                            };
                            mainarr.push(objt);
                            counter++;
                            if(counter == emails.length){
                                res.send(mainarr);
                            }
                        });
                    };        
                }
                else{
                    res.send(mainarr);
                }
            });
        }
    });
});

app.post("/check",(req,res) => {
    res.send({val: "checkresponse"});
});

app.post("/check1",(req,res) => {
    res.send({val: "check1response"});
});

app.post("/subscribe",(req,res) => {
    var subobj = [];
    subobj.push(req.body.data);
    LoggedInUsers.findOneAndUpdate({email: req.body.email},{subscription: subobj},{new:true}).then(() => {
        res.send("Success");
    });
});

server.listen(PORT,() => { console.log("Server running on  port " + PORT) });