const signupform = document.getElementById("signup");
const title = document.getElementById("title");
const loader = document.getElementById("loader");
var text = title.innerText;
var emailid = "";

signupform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(signupform.otp.hasAttribute("disabled")){
        loader.classList.remove("none");
        emailid = signupform.email.value;
        axios.post("/signup",{
            username: signupform.username.value,
            email: signupform.email.value
        }).then((result) => {
            loader.classList.add("none");
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
                    window.location = "./login.html";
                },2000);
            }
        });
    }
    else{
        loader.classList.remove("none");
        axios.post("/otp",{
            otp: signupform.otp.value,
            email: emailid
        }).then((res) => {
            loader.classList.add("none");
            signupform.reset();
            if(res.data == "success"){
                title.innerText = "user created";
                setTimeout(() => {
                    title.innerText = text;
                    window.location = "./login.html";
                },2000);
            }
            else{
                title.innerText = "invalid OTP";
            }
        });
    }
});