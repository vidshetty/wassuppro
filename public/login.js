const loginform = document.getElementById("login");
const title = document.getElementById("title");
const loader = document.getElementById("loader");
var text = title.innerText;
var emailid = "";


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
        }).catch(err => console.log(err.message));
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
                localStorage.setItem("token",result.data.token);
                window.location = "./index.html";
            }
            else{
                title.innerText = "invalid OTP";
            }
        })
    }
});