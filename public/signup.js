const signupform = document.getElementById("signup");
const title = document.getElementById("title");
const loader = document.getElementById("loader");
var text = title.innerText;

signupform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(signupform.otp.hasAttribute("disabled")){
        loader.classList.remove("none");
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
                    window.location = "./index.html";
                },2000);
            }
        }).catch(err => console.log(err.message));
    }
    else{
        loader.classList.remove("none");
        axios.post("/otp",{
            otp: signupform.otp.value
        }).then((res) => {
            loader.classList.add("none");
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