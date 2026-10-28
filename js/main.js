import {initTheme} from "./theme.js";
import {initDashboard} from "./dashboard.js";
import {initSidebar} from "./sidebar.js";
import "./transactions.js";
import * as auth from "./auth.js";
import {initBudgetPlanner} from "./budgetPlanner.js";
import {initCharts} from "./charts.js";
import {initFinancialGoals} from "./financialGoals.js";
import {initFinancialAnalysis} from "./financialAnalysis.js";


function checkLogin() {
    if (!auth.getCurrentUser()){
        window.location.replace("auth.html");
        return false;
    }
    return true;
}

window.addEventListener("pageshow", function () {
    if (!auth.getCurrentUser()) {
        window.location.replace("auth.html");
    }
});

if (checkLogin()){
    initTheme();
    initSidebar();
    initCharts();
    initDashboard();
    initBudgetPlanner();
    initFinancialGoals();
    initFinancialAnalysis();

    let logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            let isConfirmed = window.confirm("You will be logged out! Are you okay with this?");
            if (isConfirmed) {
                auth.logout();
                window.location.replace("auth.html");
            }
        });
    }
}
