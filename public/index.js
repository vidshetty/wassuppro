const socket = io.connect("",{ "sync disconnect on unload":true });
const loader = document.getElementById("loader");
const loader1 = document.getElementById("loader1");
const chatlist = document.getElementById("chatlist");
const messages = document.querySelector(".messages");
const titlepre = document.querySelector(".usertitle pre");
const addbutton = document.querySelector(".addbutton");
const endbutton = document.querySelector(".endbutton");
const videocamera = document.querySelector(".videocamera");
const p = document.querySelector(".callingto");
const p1 = document.querySelector(".callfrom");
const callermodal = document.getElementById("callermodal");
const receivermodal = document.getElementById("receivermodal");
const receivebutton = document.querySelector(".receivebutton");
const cutbutton = document.querySelector(".cutbutton");
const callui = document.querySelector(".callui");
const topdiv = document.querySelector(".top");
const bottomdiv = document.querySelector(".bottom");
const mute = document.querySelector(".mute");
const videomute = document.querySelector(".videomute");
const close = document.querySelector(".close");
var lastemail = "";
var newcount = -1;
var oldcount = 0;
var t;
var mainvalue = null;
var msginputcount = 0;
var othermsgcount = 0;
var sent = "";
var name = "";
var loggedinemail = "";
var loggedinname = "";
var chatroomtitlename = "";
var chatroomemail = "";
var randomvar = "";
var audiodisabled = "false";
var videodisabled = "false";
var videocaller = "";
var videoreceiver = "";
var peerid = "";
var call,peer,ourstream;
var constraints = {
    video: true,
    audio: true
}



if(localStorage.getItem("token") == null || localStorage.getItem("token") == ""){
    window.location = "./login.html";
}
else{
    loader.classList.remove("none");
    axios.post("/getusercred",{
        data: localStorage.getItem("token")
    }).then(result => {
        if(result.data.email != "not matching"){
            loggedinname = result.data.name;
            loggedinemail = result.data.email;
            socket.emit("initial",{
                email: loggedinemail
            });
            getallchats();
        }
        else{
            loader.classList.add("none");
            const div = document.createElement("div");
            div.setAttribute("class","nodata");
            div.textContent = "You're logged in on another device";
            chatlist.appendChild(div);
            addbutton.style.display = "none";
        }
    });
}


var textareaheightfunc = (scrollval) => {
    messages.scrollTop = messages.scrollHeight;
    var h = 70;
    if(scrollval > 43){
        messageinput.style.height = `${h + (scrollval - 42)}px`;
        messages.style.bottom = messageinput.style.height;
        messages.scrollTop = messages.scrollHeight;
    }
    else{
        messageinput.style.height = h + "px";
        messages.style.bottom = messageinput.style.height;
        messages.scrollTop = messages.scrollHeight;
    }
}

var getallchats = () => {
    axios.post("/trial",{
        data: loggedinemail
    }).then(result => {
        loader.classList.add("none");
        chatlist.innerText = "";
        if(result.data.length > 0){
            result.data.sort(compare);
            result.data.forEach(element => {
                if(element.val == 1){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    const div = document.createElement("div");
                    li1.textContent = element.name;
                    li2.textContent = element.email;
                    div.textContent = element.len;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    ul.appendChild(div);
                    chatlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        main.classList.add("none");
                        chatroom.classList.remove("none");
                        retrievechats(loggedinemail,chatroomemail);
                        socket.emit("clear",{
                            to: loggedinemail,
                            from: chatroomemail
                        });
                        chatlist.removeChild(e.currentTarget);
                    });
                }
            });
            result.data.forEach(element => {
                if(element.val == -1){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = element.name;
                    li2.textContent = element.email;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    chatlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        main.classList.add("none");
                        chatroom.classList.remove("none");
                        textarea.style.height = "42px";
                        retrievechats(loggedinemail,chatroomemail);
                    });
                }
            });
        }
        else{
            const div = document.createElement("div");
            div.setAttribute("class","nodata");
            div.textContent = "No chats";
            chatlist.appendChild(div);
        }
    });
}

var compare = (a,b) => {
    var one = a.name.toLowerCase();
    var two = b.name.toLowerCase();
    if(one > two){
        return 1;
    }
    else{
        return -1;
    }
}


var getonlinestatus = (other) => {
    socket.emit("statusreq",{
        email: other
    });
}

var retrievechats = (sender,receiver) => {
    msginputcount = 0;
    console.log("called retriever");
    othermsgcount = 0;
    loader1.classList.remove("none");
    axios.post("/retrievechats",{
        sender: sender,
        receiver: receiver
    }).then(result => {
        loader1.classList.add("none");
        lastemail = result.data.chats[(result.data.chats.length - 1)].email;
        console.log("lastemail ",lastemail);
        for(var i=0;i<result.data.chats.length;i++){
            const div1 = document.createElement("div");
            div1.setAttribute("class","eachmsg");
            const div2 = document.createElement("div");
            div2.textContent = result.data.chats[i].msg;
            if(i>0){
                if(result.data.chats[i-1].email != result.data.chats[i].email){
                    if(sender == result.data.chats[i].email){
                        div2.setAttribute("class","msg right");
                        div2.style.marginTop = "15px";
                    }
                    else{
                        div2.setAttribute("class","msg left");
                        div2.style.marginTop = "15px";
                    }
                    div1.appendChild(div2);
                    messages.appendChild(div1);
                }
                else{
                    const div1 = document.createElement("div");
                    div1.setAttribute("class","eachmsg");
                    const div2 = document.createElement("div");
                    div2.textContent = result.data.chats[i].msg;
                    if(sender == result.data.chats[i].email){
                        div2.setAttribute("class","msg right");
                    }
                    else{
                        div2.setAttribute("class","msg left");
                    }
                    div1.appendChild(div2);
                    messages.appendChild(div1);
                }
            }
            else{
                const div1 = document.createElement("div");
                div1.setAttribute("class","eachmsg");
                const div2 = document.createElement("div");
                div2.textContent = result.data.chats[i].msg;
                if(sender == result.data.chats[i].email){
                    div2.setAttribute("class","msg right");
                }
                else{
                    div2.setAttribute("class","msg left");
                }
                div1.appendChild(div2);
                messages.appendChild(div1);
            }
            messages.scrollTop = messages.scrollHeight;
        };
    });
    getonlinestatus(receiver);
}

const sendbutton = document.querySelector(".sendbutton");
const logoutbutton = document.querySelector(".logoutbutton");
const usertitle = document.querySelector(".usertitle p");
const cancelbutton = document.querySelector(".cancelbutton");
const backbutton = document.querySelector(".backbutton");
const main = document.querySelector(".main");
const chatroom = document.querySelector(".chatroom");
const addscreen = document.querySelector(".addscreen");
const textarea = document.querySelector("textarea");
const searchinput = document.getElementById("searchinput");
const resultlist = document.getElementById("resultlist");
const msginput = document.getElementById("msginput");
const messageinput = document.querySelector(".messageinput");


function movefunction(){
    close.style.top = "30px";
    mute.style.bottom = "30px";
    videomute.style.bottom = "30px";
    if(newcount > oldcount){
        oldcount = newcount;
        clearTimeout(t);
        movefunction(newcount);
    }
    else{
        t = setTimeout(() => {
            close.style.top = "-100px";
            mute.style.bottom = "-100px";
            videomute.style.bottom = "-100px";
            newcount = -1;
            oldcount = 0;
        },5000);
    }
}

closefunc = () => {
    topdiv.innerHTML = "";
    bottomdiv.innerHTML = "";
    callui.classList.add("none");
}


topdiv.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
});
bottomdiv.addEventListener("click",() => {
    newcount += 1;
    movefunction(newcount);
});
addbutton.addEventListener("click",(e) => {
    main.classList.add("none");
    addscreen.classList.remove("none");
    searchinput.value = "";
    searchinput.focus();
    resultlist.innerHTML = "";
});
cancelbutton.addEventListener("click",(e) => {
    main.classList.remove("none");
    addscreen.classList.add("none");
});
backbutton.addEventListener("click",(e) => {
    main.classList.remove("none");
    chatroom.classList.add("none");
    chatroomtitlename = "";
    messages.innerHTML = "";
    chatroomemail = "";
    msginputcount = 0;
    titlepre.innerText = "";
    getallchats();
});
logoutbutton.addEventListener("click",(e) => {
    socket.emit("delete",{
        email: loggedinemail
    });
    localStorage.clear();
    window.location = "./login.html";
});
videocamera.addEventListener("click",() => {
    callermodal.classList.remove("none");
    p.children[0].innerText = "calling....";
    p.children[1].innerText = chatroomtitlename;
    socket.emit("callreq",{
        req: 1,
        caller: loggedinemail,
        callername: loggedinname,
        receiver: chatroomemail
    });
});
endbutton.addEventListener("click",() => {
    p.children[1].innerText = "";
    callermodal.classList.add("none");
    socket.emit("callreq",{
        req: 0,
        caller: loggedinemail,
        callername: loggedinname,
        receiver: chatroomemail
    });
});
cutbutton.addEventListener("click",() => {
    p1.children[1].innerText = "";
    receivermodal.classList.add("none");
    socket.emit("callres",{
        res: 0,
        caller: randomvar,
        receiver: loggedinemail
    });
    sent = "sent";
});
mute.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
    if(audiodisabled == "false"){
        mute.style.backgroundColor = "red";
        audiodisabled = "true";
        ourstream.getAudioTracks()[0].enabled = false;
    }
    else{
        mute.style.backgroundColor = "#18171f";
        audiodisabled = "false";
        ourstream.getAudioTracks()[0].enabled = true;
    }
});
videomute.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
    if(videodisabled == "false"){
        videomute.style.backgroundColor = "red";
        videodisabled = "true";
        ourstream.getVideoTracks()[0].enabled = false;
    }
    else{
        videomute.style.backgroundColor = "#18171f";
        videodisabled = "false";
        ourstream.getVideoTracks()[0].enabled = true;
    }
});
receivebutton.addEventListener("click",() => {
    navigator.wakeLock.request("screen").then(lock => {
        mainvalue = lock;
    });
    p1.children[1].innerText = "";
    receivermodal.classList.add("none");
    peer = new Peer({host:'peerjs-server.herokuapp.com', secure:true, port:443});
    peer.on("open",id => {
        peerid = id;
        socket.emit("callres",{
            res: 1,
            peerid: peerid,
            caller: randomvar,
            callername: name,
            receiver: loggedinemail
        });
        sent = "sent";
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            const video = document.createElement("video");
            ourstream = stream;
            video.srcObject = stream;
            video.muted = true;
            video.onloadedmetadata = () => {
                video.play();
            }
            bottomdiv.append(video);
        });
        peer.on("call",call => {
            call.answer(ourstream);
            const videotop = document.createElement("video");
            call.on("stream",stream2 => {
                videotop.srcObject = stream2;
                videotop.onloadedmetadata = () => {
                    videotop.play();
                }
                topdiv.append(videotop);
            });
            call.on("close",() => {
                mainvalue.release();
                mainvalue = null;
                ourstream.getTracks().forEach(track => {
                    track.stop();
                });
                socket.emit("left",{
                    left: "receiver",
                    caller: videocaller,
                    receiver: videoreceiver
                });
            });
        });
        close.addEventListener("click",() => {
            peer.destroy();
            closefunc();
            socket.emit("left",{
                left: "caller",
                caller: videocaller,
                receiver: videoreceiver
            });
        });
    });
    videodisabled = "false";
    audiodisabled = "false";
    mute.style.backgroundColor = "#18171f";
    videomute.style.backgroundColor = "#18171f";
    callui.classList.remove("none");
    movefunction();
});
window.onresize = function(){
    textareaheightfunc(42);
    console.log("window ",window.height);
}
textarea.addEventListener("input",(e) => {
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
    textareaheightfunc(e.currentTarget.scrollHeight);
});
searchinput.addEventListener("keyup",(e) => {
    if(searchinput.value.match(/^[0-9a-zA-Z]+$/)){
        loader.classList.remove("none");
        axios.post("/searchuser",{
            data: searchinput.value,
            token: localStorage.getItem("token")
        }).then(result => {
            loader.classList.add("none");
            if(result.data.arr != "not found"){
                var account = result.data.arr;
                resultlist.innerHTML = "";
                for(var i=0;i<account.length;i++){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = account[i].name;
                    li2.textContent = account[i].email;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    resultlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        addscreen.classList.add("none");
                        chatroom.classList.remove("none");
                        retrievechats(loggedinemail,chatroomemail);
                    }); 
                };
            }
            else{
                resultlist.innerHTML = "";
                const div = document.createElement("div");
                div.setAttribute("class","nodata");
                div.textContent = "No results";
                resultlist.appendChild(div);
            }
        });
    }
    else{
        resultlist.innerHTML = "";
    }
});
msginput.addEventListener("keyup",(e) => {
    if(e.target.value != ""){
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "typing"
        });
    }
    else{
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "stopped"
        });
    }
});
sendbutton.addEventListener("click",(e) => {
    var msg = msginput.value;
    if(msg.match(/^[\s]*$/)){
        msginput.value = "";
        textareaheightfunc(textarea.scrollHeight);
    }
    else{
        const divmain = document.createElement("div");
        const divin = document.createElement("div");
        divmain.setAttribute("class","eachmsg");
        divin.setAttribute("class","msg right");
        divin.textContent = msg;
        divmain.appendChild(divin);
        if(msginputcount == 0 && lastemail == chatroomemail){
            divin.style.marginTop = "15px";
        }
        lastemail = loggedinemail;
        console.log(lastemail);
        msginputcount += 1;
        othermsgcount = 0;
        messages.appendChild(divmain);
        messages.scrollTop = messages.scrollHeight;
        msginput.value = "";
        textarea.style.height = "auto";
        textareaheightfunc(textarea.scrollHeight);
        socket.emit("sendmsg",{
            sender: loggedinemail,
            receiver: chatroomemail,
            message: msg
        });
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "stopped"
        });
    }
});


socket.on("livemsg",data => {
    if(chatroomemail == data.sender){
        const div1 = document.createElement("div");
        div1.setAttribute("class","eachmsg");
        const div2 = document.createElement("div");
        div2.textContent = data.msg;
        div2.setAttribute("class","msg left");
        div1.appendChild(div2);
        if(othermsgcount == 0 && lastemail == loggedinemail){
            div2.style.marginTop = "15px";
        }
        lastemail = chatroomemail;
        console.log(lastemail);
        othermsgcount += 1;
        msginputcount = 0;
        messages.appendChild(div1);
        messages.scrollTop = messages.scrollHeight;
    }
    else{
        socket.emit("addingnewmsg",{
            from: data.sender,
            to: loggedinemail,
            msg: data.msg
        });
    }
});

socket.on("statusres",data => {
    if(chatroomemail == data.email){
        if(data.status == "online"){
            titlepre.innerText = "online";
        }
        else{
            titlepre.innerText = "";
        }
    }
});

socket.on("typingyes",val => {
    if(chatroomemail == val.sender){
        if(val.data == "yes"){
            titlepre.innerText = "typing";
        }
        else{
            titlepre.innerText = "online";
        }
    }
});

socket.on("confirm",() => {
    getallchats();
});

socket.on("callrequest",data => {
    if(data.req == -1){  
        p.children[0].innerText = "offline";
        setTimeout(() => {
            callermodal.classList.add("none");
        },2000);
    }
});

socket.on("callreq",data => {
    if(data.req == 0){
        p1.children[0].innerText = "caller left";
        videocaller = "";
        videoreceiver = "";
        setTimeout(() => {
            p.children[0].innerText = "";
            receivermodal.classList.add("none");
        },1000);
    }
    else{
        randomvar = data.caller;
        name = data.callername;
        receivermodal.classList.remove("none");
        sent = "";
        p1.children[0].innerText = "incoming video call from";
        p1.children[1].innerText = data.callername;
        videocaller = data.caller;
        videoreceiver = data.receiver;
        setTimeout(() => {
            socket.emit("callres",{
                res: -1,
                caller: randomvar,
                receiver: loggedinemail
            });
            receivermodal.classList.add("none");
        },30000);
    }
});

socket.on("callres",data => {
    if(data.res == 0){
        p.children[0].innerText = "call declined";
        setTimeout(() => {
            p.children[0].innerText = "";
            callermodal.classList.add("none");
        },1000);
    }
    else if(data.res == -1){
        p.children[0].innerText = "no response";
        setTimeout(() => {
            p.children[0].innerText = "";
            callermodal.classList.add("none");
        },2000);
    }
    else{
        videocaller = data.caller;
        videoreceiver = data.receiver;
        name = chatroomtitlename;
        callermodal.classList.add("none");
        videodisabled = "false";
        audiodisabled = "false";
        mute.style.backgroundColor = "#18171f";
        videomute.style.backgroundColor = "#18171f";
        callui.classList.remove("none");
        peer = new Peer({host:'peerjs-server.herokuapp.com', secure:true, port:443});
        peer.on("open",id => {
            peerid = id;
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                const video = document.createElement("video");
                ourstream = stream;
                video.srcObject = stream;
                video.muted = true;
                video.onloadedmetadata = () => {
                    video.play();
                }
                bottomdiv.append(video);
                const videotop = document.createElement("video");
                call = peer.call(data.peerid,stream);
                navigator.wakeLock.request("screen").then(lock => {
                    mainvalue = lock;
                });
                call.on("stream",stream2 => {
                    videotop.srcObject = stream2;
                    videotop.onloadedmetadata = () => {
                        videotop.play();
                    }
                    topdiv.append(videotop);
                });
                call.on("close",() => {
                    mainvalue.release();
                    mainvalue = null;
                    ourstream.getTracks().forEach(track => {
                        track.stop();
                    });
                });
            });
            close.addEventListener("click",() => {
                peer.destroy();
                closefunc();
                socket.emit("left",{
                    left: "caller",
                    caller: videocaller,
                    receiver: videoreceiver
                });
            });
        });
        movefunction();
    }
});

socket.on("left",() => {
    topdiv.innerHTML = "";
    const newdiv = document.createElement("div");
    const newp = document.createElement("p");
    newp.textContent = `${name} left`;
    newdiv.appendChild(newp);
    topdiv.appendChild(newdiv);
    setTimeout(() => {
        peer.destroy();
        closefunc();
        topdiv.innerHTML = "";
    },2000);
});

document.addEventListener("visibilitychange",() => {
    if(document.visibilityState == "hidden"){
        socket.disconnect();
        console.log("socket disconnected");
    }
    else{
        socket.connect();
        console.log("socket connected");
        socket.emit("onconnect"{
            email: loggedinemail
        });
    }
});