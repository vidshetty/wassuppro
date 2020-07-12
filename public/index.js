const loginform = document.getElementById("login");
const title = document.getElementById("title");
var text = title.innerText;

loginform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(loginform.otp.hasAttribute("disabled")){
        axios.post("/login",{
            email: loginform.email.value
        }).then((result) => {
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
        axios.post("/otp",{
            otp: loginform.otp.value
        }).then((result) => {
            loginform.reset();
            if(result.data.msg == "success"){
                localStorage.setItem("token",result.data.token);
                title.innerText = "Logging in";
                setTimeout(() => {
                    title.innerText = text;
                },2000);
            }
            else{
                title.innerText = "invalid OTP";
            }
        })
    }
});