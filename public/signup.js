const signupform = document.getElementById("signup");
const title = document.getElementById("title");
var text = title.innerText;

signupform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(signupform.otp.hasAttribute("disabled")){
        axios.post("/signup",{
            username: signupform.username.value,
            email: signupform.email.value
        }).then((result) => {
            signupform.reset();
            if(result.data == "otp"){
                signupform.username.disabled = true;
                signupform.email.disabled = true;
                signupform.otp.removeAttribute("disabled");
                title.innerText = "OTP sent";
            }
            else{
                title.innerText = "user exists";
                setTimeout(() => {
                    title.innerText = text;
                    window.location = "./index.html";
                },2000);
            }
        }).catch(err => console.log(err.message));
    }
    else{
        axios.post("/otp",{
            otp: signupform.otp.value
        }).then((res) => {
            signupform.reset();
            if(res.data == "success"){
                title.innerText = "user created";
                setTimeout(() => {
                    title.innerText = text;
                    window.location = "./index.html";
                },2000);
            }
            else{
                title.innerText = "invalid OTP";
            }
        }).catch(err => console.log(err.message));
    }
});