const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const mongoose = require("mongoose");
const Users = require("./Models/Users");
const Messages = require("./Models/Messages");
const LoggedInUsers = require("./Models/LoggedInUsers");
const nodemailer = require("nodemailer");
const { v4:uuidv4 } = require("uuid");
const PORT = process.env.PORT || 8000;
var randomotp = 0;
var account = [];

mongoose.connect("mongodb+srv://vid_shetty:itsmemongodb1998@tictactoe.jfyxk.mongodb.net/wassup?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.connection.once("open",() => {
    console.log("Database connected");
});
mongoose.connection.on("error",() => {
    console.log("error");
})

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
        console.log(result);
    }).catch(err => console.log(err.message));
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
        console.log("new chat saved");
    });
}

var mailer = (req) => {
    randomotp = generateotp();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'wassupnode@gmail.com',
          pass: 'itsmeWASSUP@1998'
        }
    });
      
    var mailOptions = {
        from: 'wassupnode@gmail.com',
        to: req.body.email,
        subject: 'Verification mail from Wassup!',
        text: `Your verification password is "${randomotp}". Do not reply or forward this mail.` 
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent:');
        }
    });
}

io.on("connection",socket => {
    socket.on("initial",data => {
        LoggedInUsers.findOneAndUpdate({email: data.email},{socketid: socket.id,status: "online"},{new:true}).then((doc) => {
        }).catch(err => console.log(err.message));
    });

    socket.on("sendmsg",data => {
        var counter = 1;
        Messages.find().then(docs => {
            docs.forEach(doc => {
                if(data.sender == doc.users[0] || data.sender == doc.users[1]){
                    if(data.receiver == doc.users[0] || data.receiver == doc.users[1]){
                        counter = 2;
                        // console.log("counter inside",counter);
                        addmsg(doc,data);
                    }
                }
            });
            if(counter == 1){
                createmsg(data);
            }    
        }).catch(err => console.log(err.message));
        // console.log("counter outside",counter);
    });

    socket.on("disconnect",() => {
        LoggedInUsers.findOneAndUpdate({socketid: socket.id},{status: "offline"},{new:true}).then((doc) => {
        }).catch(err => console.log(err.message));
    })
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
    })
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
                            console.log("registered loggedinuser");
                        }); 
                    }
                }).catch(err => console.log(err.message));
                var jwt = uuidv4();
                console.log(jwt);
                Users.findOneAndUpdate({email: email},{jwt: jwt}).then((docu) => {
                }).catch(err => console.log(err.message));
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
                            console.log("registered loggedinuser");
                        }); 
                    }
                }).catch(err => console.log(err.message));
                var user = new Users({
                    username: username,
                    email: email
                });
                user.save().then((result) => {
                    res.send("success");
                });
            }
            randomotp = 0;
        }).catch(err => console.log(err.message));
    }
    else{
        res.send("invalid");
    }
});

app.post("/getusercred",(req,res) => {
    Users.findOne({jwt: req.body.data}).then(result => {
        res.send({
            name: result.username,
            email: result.email
        });
    }).catch(err => console.log(err.message));
});

app.post("/searchuser",(req,res) => {
    Users.find({jwt: {$ne:req.body.token}}).then(result => {
        if(result != null){
            result.forEach(doc => {
                if(doc.username.startsWith(req.body.data) == true){
                    var obj = {
                        name: doc.username,
                        email: doc.email
                    };
                    account.push(obj);
                    console.log(obj);
                }
                else if(doc.email.startsWith(req.body.data) == true){
                    var obj = {
                        name: doc.username,
                        email: doc.email
                    };
                    account.push(obj);
                }
            });
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
    }).catch(err => console.log(err.message));
});

app.post("/getallchats",(req,res) => {
    var counter = 0;
    var emails = [];
    var newarr = [];
    Messages.find().then(docs => {
        docs.forEach(doc => {
            if(req.body.data == doc.users[0]){
                emails.push(doc.users[1]);
            }
            if(req.body.data == doc.users[1]){
                emails.push(doc.users[0]);
            }
        });
        if(emails.length > 0){
            emails.forEach(em => {
                Users.findOne({email: em}).then(result => {
                    var objt = {
                        name: result.username,
                        email: result.email
                    };
                    newarr.push(objt);
                    counter++;
                    if(counter == emails.length){
                        res.send({value: newarr});
                    }
                }).catch(err => console.log(err.message));
            });        
        }
        else{
            res.send({value: "none"});
        }
    }).catch(err => console.log(err.message));
});

app.post("/retrievechats",(req,res) => {
    Messages.find().then(docs => {
        docs.forEach(doc => {
            if((doc.users[0] == req.body.sender && doc.users[1] == req.body.receiver) || (doc.users[0] == req.body.receiver && doc.users[1] == req.body.sender)){
                res.send({chats: doc.msg});                
            }
        })
    })
});


server.listen(PORT,() => { console.log("Server running on  port " + PORT) });