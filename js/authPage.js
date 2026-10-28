import {initTheme} from "./theme.js";
import * as auth from "./auth.js";
initTheme();

let currentUser = auth.getCurrentUser();
if (currentUser){
    window.location.href = "index.html";
}

let loginTab = document.querySelector("#login-tab");
let signupTab = document.querySelector("#signup-tab");
let loginForm = document.querySelector("#login-form");
let signupForm = document.querySelector("#signup-form");
let formTitle = document.querySelector("#form-title");
let formDescription = document.querySelector("#form-description");
let loginPass = document.querySelector("#login-password");
let loginPassToggle = document.querySelector("#login-password-toggle");
let signupPass = document.querySelector("#signup-password");
let signupPassToggle = document.querySelector("#signup-password-toggle");
let loginPassIcon = loginPassToggle.querySelector("i");
let signupPassIcon = signupPassToggle.querySelector("i");
let loginEmail = document.querySelector("#login-email");
let loginMessage = document.querySelector("#login-message");
let signupMessage = document.querySelector("#signup-message");
let signupName = document.querySelector("#signup-name");
let signupEmail = document.querySelector("#signup-email");
let signupConfirmPass = document.querySelector("#signup-confirm-password");

function switchTab(tab){
    if (tab === "signup"){
        loginForm.hidden = true;
        signupForm.reset();
        signupForm.hidden = false;
        loginTab.classList.remove("selected-tab");
        signupTab.classList.add("selected-tab");
        formTitle.textContent = "Create your account";
        formDescription.textContent = "Start managing your money smarter today.";
    }
    else{
        signupForm.hidden = true;
        loginForm.hidden = false;
        loginForm.reset();
        loginTab.classList.add("selected-tab");
        signupTab.classList.remove("selected-tab");
        formTitle.textContent = "Welcome back";
        formDescription.textContent = "Sign in to continue to your account.";
    }
}

loginTab.addEventListener("click",()=>{
    switchTab("login");
})

signupTab.addEventListener("click",()=>{
    switchTab("signup");
})

let switchBtns = document.querySelectorAll(".switch-button");
switchBtns.forEach((btn)=>{
    btn.addEventListener("click",()=>{
        switchTab(btn.dataset.tab);
    })
})

loginPassToggle.addEventListener("click",()=>{
    if (loginPass.type === "text"){
        loginPass.type = "password";
        loginPassIcon.classList.remove("fa-eye-slash");
        loginPassIcon.classList.add("fa-eye");
    }
    else{
        loginPass.type = "text";
        loginPassIcon.classList.remove("fa-eye");
        loginPassIcon.classList.add("fa-eye-slash");
    }
})

signupPassToggle.addEventListener("click",()=>{
    if (signupPass.type === "text"){
        signupPass.type = "password";
        signupPassIcon.classList.remove("fa-eye-slash");
        signupPassIcon.classList.add("fa-eye");
    }
    else{
        signupPass.type = "text";
        signupPassIcon.classList.add("fa-eye-slash");
        signupPassIcon.classList.remove("fa-eye");
    }
})

loginForm.addEventListener("submit",async (event)=>{
    loginMessage.textContent = "";
    loginMessage.classList.remove("success","error");
    event.preventDefault();
    loginMessage.textContent = "";
    let email = loginEmail.value;
    let password = loginPass.value;
    let loginData = await auth.login(email,password);
    if (loginData.success){
        window.location.href = "index.html";
    }
    else{
        loginMessage.textContent = loginData.message;
        loginMessage.classList.add("error");
    }
});

signupForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    signupMessage.textContent = "";
    let name = signupName.value;
    let email = signupEmail.value;
    let password = signupPass.value;
    let confirmPass = signupConfirmPass.value;
    if (password != confirmPass){
        signupMessage.textContent = "Passwords do not match.";
        return;
    }
    let signupData = await auth.signup(name,email,password);
    if (signupData.success){
        switchTab("login");
        loginMessage.textContent = "Successfully created your account. Please Login!";
        loginMessage.classList.remove("error");
        loginMessage.classList.add("success");
    }
    else{
        signupMessage.textContent = signupData.message;
    }
});