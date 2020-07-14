const socket = io.connect("",{ "sync disconnect on unload":true });
const loader = document.getElementById("loader");
const chatlist = document.getElementById("chatlist");
const messages = document.querySelector(".messages");
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
        loggedinname = result.data.name;
        loggedinemail = result.data.email;
        socket.emit("initial",{
            email: loggedinemail
        });
        console.log(loggedinemail);
        axios.post("/getallchats",{
            data: loggedinemail
        }).then(result => {
            loader.classList.add("none");
            console.log(result);
            if(result.data.value == "none"){
                chatlist.innerHTML = "";
                const div = document.createElement("div");
                div.setAttribute("class","nodata");
                div.textContent = "No chats";
                chatlist.appendChild(div);
            }
            else{
                result.data.value.forEach(doc => {
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = doc.name;
                    li2.textContent = doc.email;
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
                });
            }
        }).catch(err => console.log(err.message));
    }).catch(err => console.log(err.message));
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

var retrievechats = (sender,receiver) => {
    loader.classList.remove("none");
    axios.post("/retrievechats",{
        sender: sender,
        receiver: receiver
    }).then(result => {
        loader.classList.add("none");
        console.log(result.data);
        result.data.chats.forEach(mssg => {
            const div1 = document.createElement("div");
            div1.setAttribute("class","eachmsg");
            const div2 = document.createElement("div");
            div2.textContent = mssg.msg;
            if(sender == mssg.email){
                div2.setAttribute("class","msg right");
            }
            else{
                div2.setAttribute("class","msg left");
            }
            div1.appendChild(div2);
            messages.appendChild(div1);
        });
    }).catch(err => console.log(err.message));
}

const addbutton = document.querySelector(".addbutton");
const sendbutton = document.querySelector(".sendbutton");
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

messages.scrollTop = messages.scrollHeight;

addbutton.addEventListener("click",(e) => {
    main.classList.add("none");
    addscreen.classList.remove("none");
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
                account.forEach(element => {
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = element.name;
                    li2.textContent = element.email;
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
                });
            }
            else{
                resultlist.innerHTML = "";
                const div = document.createElement("div");
                div.setAttribute("class","nodata");
                div.textContent = "No results";
                resultlist.appendChild(div);
            }
        }).catch(err => console.log(err.message));
    }
    else{
        resultlist.innerHTML = "";
    }
});
sendbutton.addEventListener("click",(e) => {
    var msg = msginput.value;
    console.log(msg);
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
});