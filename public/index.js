const socket = io.connect("",{ "sync disconnect on unload":true });
const loader = document.getElementById("loader");
const chatlist = document.getElementById("chatlist");
const messages = document.querySelector(".messages");
const titlepre = document.querySelector(".usertitle pre");
const addbutton = document.querySelector(".addbutton");
var loggedinemail = "";
var loggedinname = "";
var chatroomtitlename = "";
var chatroomemail = "";


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
    var h = 70;
    if(scrollval > 43){
        messageinput.style.height = `${h + (scrollval + 20 - 42)}px`;
    }
    else{
        messageinput.style.height = h + "px";
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
            console.log(result.data);
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
    loader.classList.remove("none");
    axios.post("/retrievechats",{
        sender: sender,
        receiver: receiver
    }).then(result => {
        loader.classList.add("none");
        for(var i=0;i<result.data.chats.length;i++){
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


addbutton.addEventListener("click",(e) => {
    main.classList.add("none");
    addscreen.classList.remove("none");
    searchinput.value = "";
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
    getallchats();
});
logoutbutton.addEventListener("click",(e) => {
    socket.emit("delete",{
        email: loggedinemail
    });
    localStorage.clear();
    window.location = "./login.html";
});
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
    if(msg != ""){
        var html = `
        <div class="eachmsg">
        <div class="msg right">
            ${msg}
        </div>
        </div>`;
        messages.innerHTML += html;
    }    
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
});

socket.on("livemsg",data => {
    if(chatroomemail == data.sender){
        const div1 = document.createElement("div");
        div1.setAttribute("class","eachmsg");
        const div2 = document.createElement("div");
        div2.textContent = data.msg;
        div2.setAttribute("class","msg left");
        div1.appendChild(div2);
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

socket.on("confirm",data => {
    getallchats();
});