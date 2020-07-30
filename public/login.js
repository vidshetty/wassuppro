const loginform = document.getElementById("login");
const title = document.getElementById("title");
const loader = document.getElementById("loader");
var text = title.innerText;
var emailid = "";
var pubkey = "BEcF57uMF5LyK9boqYxf-9q21GdcWX707xxPz-MWieIhCI4lwBCgP9xtxWeYq632HaR0b9mwI9GW1dxs6r2zoV0";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


loginform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(loginform.otp.hasAttribute("disabled")){
        loader.classList.remove("none");
        emailid = loginform.email.value;
        axios.post("/login",{
            email: loginform.email.value
        }).then((result) => {
            loader.classList.add("none");
            loginform.reset();
            if(result.data == "otp"){
                loginform.otp.removeAttribute("disabled");
                loginform.email.disabled = true;
                title.innerText = "OTP sent";
            }
            else{
                title.innerText = "user not found";
                setTimeout(() => {
                    title.innerText = text;
                },2000);
            }
        });
    }
    else{
        loader.classList.remove("none");
        axios.post("/otp",{
            otp: loginform.otp.value,
            email: emailid
        }).then((result) => {
            loader.classList.add("none");
            loginform.reset();
            if(result.data.msg == "success"){
                    if("serviceWorker" in navigator){
                        navigator.serviceWorker.register("./sw.js").then(sw => {
                            sw.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(pubkey)
                            }).then(subs => {
                                if(Notification.permission == "granted"){
                                    axios.post("/subscribe",{
                                        data: JSON.stringify(subs),
                                        email: emailid
                                    }).then(data => {
                                        localStorage.setItem("token",result.data.token);
                                        window.location = "./index.html";
                                    });
                                }
                            });
                        });
                    }
            }
            else{
                title.innerText = "invalid OTP";
            }
        })
    }
});