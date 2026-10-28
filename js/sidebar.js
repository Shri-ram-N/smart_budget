export function initSidebar(){
    let menuBtn = document.getElementById("menu-btn");
    let sidebar = document.querySelector(".sidebar");
    let sidebarOverlay = document.getElementById("sidebar-overlay");
    let img = document.querySelector("#imgLogoSideBar");
    let btn = document.querySelector("#dashboard-btn");

    img.addEventListener("click",()=>{
        btn.click();
    })

    menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("show");
    });

    sidebarOverlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");
    });

    let allSideBarBtns = document.querySelectorAll(".side-bar-btns:not(#logout-btn)");
    let allSections = document.querySelectorAll(".main-content > section");
    let sectionMap = {
        "dashboard-btn": "dashboard-section",
        "transaction-btn": "transactions-section",
        "budgets-btn": "budgets-section",
        "financial-analysis-btn": "financial-analysis-section",
        "goals-btn":"goals-section"
    };
    allSideBarBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            allSideBarBtns.forEach((ele) => {
                ele.classList.remove("side-bar-btn-active");
            });
            btn.classList.add("side-bar-btn-active");
            allSections.forEach((section) => {
                section.classList.remove("section-active");
            });
            let sectionId = sectionMap[btn.id];
            localStorage.setItem("lastVisitedSection", sectionId);
            let targetSection = document.getElementById(sectionId);
            if (targetSection){
                targetSection.classList.add("section-active");
            }
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("show");
        });
    });

    document.addEventListener("keydown",(event) => {
        if (event.key === "Escape"){
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("show");
        }
    })

    let lastVisitedSection = localStorage.getItem("lastVisitedSection");
    let defaultSection = "dashboard-section";
    let sectionToShow = document.getElementById(lastVisitedSection)? lastVisitedSection: defaultSection;
    allSections.forEach((section) => {
        section.classList.remove("section-active");
    });
    document.getElementById(sectionToShow).classList.add("section-active");
    allSideBarBtns.forEach((btn) => {
        btn.classList.remove("side-bar-btn-active");
        if (sectionMap[btn.id] === sectionToShow) {
            btn.classList.add("side-bar-btn-active");
        }
    });
    localStorage.setItem("lastVisitedSection", sectionToShow);
    document.querySelector(".sidebar").addEventListener("wheel",(event)=>{
        event.preventDefault();
    }, 
    {passive: false});
}