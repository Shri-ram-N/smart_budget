export function initTheme(){
    let themeBtn = document.querySelector("#theme-toggle-btn");
    let themeIcon = document.querySelector("#theme-icon");
    let themeText = document.querySelector("#theme-text");
    let imgLogoSideBar = document.querySelector("#imgLogoSideBar");
    let loadingLogo = document.querySelector(".dashboard-loading-logo img");
    
    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
    }
    else{
        document.body.classList.remove("dark-mode");
    }

    if(!themeBtn){
        return;
    }

    if(document.body.classList.contains("dark-mode")){
        themeBtn.classList.add("active");
        if(themeIcon){
            themeIcon.className = "fa-regular fa-moon";
        }
        if(themeText){
            themeText.textContent = "Dark mode";
        }
        if(imgLogoSideBar){
            imgLogoSideBar.src = "images/dark-logo-img.png";
            if (loadingLogo){
                loadingLogo.src = "images/dark-logo-img.png";
            }
        }
    }
    else{
        themeBtn.classList.remove("active");
        if(themeIcon){
            themeIcon.className = "fa-regular fa-sun";
        }
        if(themeText){
            themeText.textContent = "Light mode";
        }
        if(imgLogoSideBar){
            imgLogoSideBar.src = "images/logo-img.png";
            if (loadingLogo){
                loadingLogo.src = "images/logo-img.png";
            }
        }
    }

    themeBtn.addEventListener("click",function(){
        document.body.classList.toggle("dark-mode");
        themeBtn.classList.toggle("active");
        if(document.body.classList.contains("dark-mode")){
            if(themeIcon){
                themeIcon.className = "fa-regular fa-moon";
            }
            if(themeText){
                themeText.textContent = "Dark mode";
            }
            if(imgLogoSideBar){
                imgLogoSideBar.src = "images/dark-logo-img.png";
                if (loadingLogo){
                    loadingLogo.src = "images/dark-logo-img.png";
                }
            }
            localStorage.setItem("theme","dark");
            window.dispatchEvent(new Event("theme-changed"));
        }
        else{
            if(themeIcon){
                themeIcon.className = "fa-regular fa-sun";
            }
            if(themeText){
                themeText.textContent = "Light mode";
            } 
            if(imgLogoSideBar){
                imgLogoSideBar.src = "images/logo-img.png";
                if (loadingLogo){
                    loadingLogo.src = "images/logo-img.png";
                }
            }
            localStorage.setItem("theme","light");
            window.dispatchEvent(new Event("theme-changed"));
        }
    });
}
