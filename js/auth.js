export function getUsers(){
    let storedUsers = localStorage.getItem("users");
    if (storedUsers === null){
        return [];
    }
    let users = JSON.parse(storedUsers);
    if (!Array.isArray(users)){
        throw new Error("Stored users data is invalid. Signup cancelled to protect existing data.");
    }
    return users;
}

export function saveUsers(users){
    localStorage.setItem("users",JSON.stringify(users));
}

export async function hashPassword(password){
    let rawData = new TextEncoder().encode(password);
    let hashBuffer = await crypto.subtle.digest("SHA-256",rawData);
    let hashArray = Array.from(new Uint8Array(hashBuffer));
    let hexaDecimalHash = hashArray.map(byte => byte.toString(16).padStart(2,"0")).join("");
    return hexaDecimalHash;
}

export async function signup(name,email,password){
    if (name.trim() === "" || email.trim() === "" || password.trim() === ""){
        return {
            success:false,
            message:"Dear User, Missing Signup Fields!"
        }
    }
    let passwordRules = [/[A-Z]/,/[a-z]/,/[0-9]/,/[^A-Za-z0-9]/];
    let isPasswordValid = passwordRules.every(rule => rule.test(password));
    if (!isPasswordValid || password.length < 8){
        return {
            success: false,
            message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
        };
    }
    let users = getUsers();
    let signupEmail = email.trim().toLowerCase();
    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailValidation = validEmail.test(signupEmail);
    if (!emailValidation){
        return {
            success:false,
            message:"Dear User, This email is Invalid!"
        }
    }
    let emailExists = users.some(user => user.email === signupEmail);
    if (emailExists){
        return {
            success:false,
            message:"Dear User, This email is already registered!"
        }
    }
    else{
        let hashedPassword = await hashPassword(password);
        let newUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: signupEmail,
            password: hashedPassword
        }
        users.push(newUser);
        saveUsers(users);
        return {
            success:true,
            message:"Dear User, You've successfully signed up."
        }
    }
}

export async function login(email,password){
    if (email.trim() === "" || password.trim() === ""){
        return {
            success:false,
            message:"Dear User, Missing Sign in Fields!"
        }
    }
    let signinEmail = email.trim().toLowerCase();
    let users = getUsers();
    let selectedUser = users.find(user=>user.email === signinEmail);
    if (!selectedUser){
        return {
            success: false,
            message: "Invalid email or password."
        }
    }
    let hashedPassword = await hashPassword(password);
    if (hashedPassword !== selectedUser.password){
        return {
            success: false,
            message: "Invalid email or password."
        }
    }
    localStorage.setItem("currentUserId",selectedUser.id);
    return {
        success: true,
        message: "Login successful."
    }
}

export function getCurrentUser(){
    let currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
        return null;
    }
    let users = getUsers();
    let currentUser = users.find(user => user.id === currentUserId);
    return currentUser || null;
}

export function logout(){
    localStorage.removeItem("currentUserId");
    return {
        success: true,
        message: "Logged out successfully."
    };
}

export function updateProfile(userId,name,email){
    if (name.trim() === "" || email.trim() === ""){
        return {
            success: false,
            message: "Name and email are required."
        };
    }
    let users = getUsers();
    let selectedUser = users.find(user => user.id === userId);
    if (!selectedUser){
        return {
            success: false,
            message: "User not found."
        };
    }
    let updatedEmail = email.trim().toLowerCase();
    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validEmail.test(updatedEmail)){
        return {
            success: false,
            message: "Please enter a valid email address."
        };
    }
    let emailExists = users.some(user => {
        return user.id !== userId && user.email === updatedEmail;
    });
    if (emailExists){
        return {
            success: false,
            message: "This email is already registered."
        };
    }
    selectedUser.name = name.trim();
    selectedUser.email = updatedEmail;
    saveUsers(users);
    return {
        success: true,
        message: "Profile updated successfully."
    };
}

export async function verifyCurrentPassword(userId,password){
    let users = getUsers();
    let selectedUser = users.find(user => user.id === userId);
    if (!selectedUser){
        return false;
    }
    let hashedPassword = await hashPassword(password);
    return hashedPassword === selectedUser.password;
}
