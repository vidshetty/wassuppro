const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const mongoose = require("mongoose");
const axios = require("axios");
const Users = require("./Models/Users");
const nodemailer = require("nodemailer");
const { v4:uuidv4 } = require("uuid");
const PORT = process.env.PORT || 8000;
var randomotp = 0;
var username = "";
var email = "";

mongoose.connect("mongodb+srv://vid_shetty:itsmemongodb1998@tictactoe.jfyxk.mongodb.net/wassup?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once("open",() => {
    console.log("Database connected");
});

app.use(express.static("public"));
app.use(express.json());

var generateotp = () => {
    return parseInt((Math.random() * 10) * 1000000);
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

app.post("/login",(req,res) => {
    email = req.body.email;
    Users.findOne({email: req.body.email}).then((doc) => {
        if(doc != null){
            mailer(req);
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
        Users.findOne({email: email}).then((doc) => {
            if(doc == null){
                var user = new Users({
                    username: username,
                    email: email
                });
                user.save().then((result) => {
                    res.send("success");
                });
            }
            else{
                var jwt = uuidv4();
                console.log(jwt);
                Users.findOneAndUpdate({email: email},{jwt: jwt}).then((docu) => {
                    console.log("updated token");
                }).catch(err => console.log(err.message));
                res.send({
                    msg: "success",
                    token: jwt
                });
            }
            randomotp = 0;
            username = "";
            email = "";
        }).catch(err => console.log(err.message));
    }
    else{
        res.send("invalid");
    }
});


app.listen(PORT,() => { console.log("Server running on  port " + PORT) });