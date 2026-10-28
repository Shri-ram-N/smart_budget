import {getCategory} from "./categoryConfig.js";
import {formatCurrency} from "./utils.js";
import {updateSpendingChart,updateMonthlySummary} from "./charts.js";
import * as auth from "./auth.js";
let currentUser = auth.getCurrentUser();
if (!currentUser) {
    window.location.href = "auth.html";
    throw new Error("User is not logged in.");
}

let currentUserId = currentUser.id;
let transactionUserKey = `transactions_${currentUserId}`;


function showDashboardLoading(){
    let loadingOverlay = document.querySelector("#dashboard-loading-overlay");
    let progressBar = document.querySelector("#dashboard-loading-progress");
    let percentageText = document.querySelector("#dashboard-loading-percentage");

    if (!loadingOverlay){
        return;
    }
    loadingOverlay.hidden = false;
    loadingOverlay.classList.remove("fade-out");
    if (progressBar){
        progressBar.style.width = "0%";
    }
        
    if (percentageText){
        percentageText.textContent = "0%";
    }
    let startTime = Date.now();
    let loadingDuration = 3000;

    function updateProgress(){
        let spent = Date.now() - startTime;
        let progress = Math.min((spent/loadingDuration) * 100,100);

        if (progressBar){
            progressBar.style.width = `${progress}%`;
        }
        if (percentageText){
            percentageText.textContent = `${Math.floor(progress)}%`;
        }

        if (progress < 100){
            requestAnimationFrame(updateProgress);
        }
    }

    requestAnimationFrame(updateProgress);
    setTimeout(() => {
        loadingOverlay.classList.add("fade-out");
        setTimeout(() => {
            loadingOverlay.hidden = true;
            loadingOverlay.classList.remove("fade-out");
        }, 350);
    },loadingDuration);
}

export function initDashboard(){
    showDashboardLoading();
    let userName = capitalizeName(currentUser.name);
    let welcomeMsg = document.querySelector(".welcome-msg");
    let firstLetter = document.querySelector("#profile-first-letter");
    firstLetter.textContent = userName.charAt(0).toUpperCase();
    let myProfileBtn = document.querySelector("#my-profile-btn");
    let profileModal = document.querySelector("#profile-modal-overlay");
    let profileCloseBtn = document.querySelector("#profile-modal-close");
    let profileCancelBtn = document.querySelector("#profile-cancel-btn");
    let profileForm = document.querySelector("#profile-form");
    let profileNameInput = document.querySelector("#profile-name-input");
    let profileEmailInput = document.querySelector("#profile-email-input");
    let profileModalName = document.querySelector("#profile-modal-name");
    let profileModalEmail = document.querySelector("#profile-modal-email");
    let profileModalAvatar = document.querySelector("#profile-modal-avatar");
    let profileMessage = document.querySelector("#profile-form-message");
    let exportDataBtn = document.querySelector("#export-data-btn");
    let exportModal = document.querySelector("#export-modal-overlay");
    let exportCloseBtn = document.querySelector("#export-modal-close");
    let exportCancelBtn = document.querySelector("#export-cancel-btn");
    let exportFormat = document.querySelector("#export-format");
    let exportFormatDescription = document.querySelector("#export-format-description");
    let exportMessage = document.querySelector("#export-modal-message");
    let exportDownloadBtn = document.querySelector("#export-download-btn");
    let profilePasswordField = document.querySelector("#profile-password-field");
    let profilePasswordInput = document.querySelector("#profile-current-password");

    function updateProfilePreview(){
        let name = capitalizeName(profileNameInput.value);
        profileModalName.textContent = name || "Your Name";
        profileModalEmail.textContent = profileEmailInput.value.trim();
        profileModalAvatar.textContent = name ? name.charAt(0).toUpperCase() : "?";
    }

    function openProfileModal(){
        profilePasswordInput.value = "";
        profilePasswordField.hidden = true;
        profilePasswordInput.required = false;
        profileNameInput.value = currentUser.name;
        profileEmailInput.value = currentUser.email;
        profileMessage.textContent = "";
        profileMessage.className = "profile-form-message";
        updateProfilePreview();
        profileModal.classList.add("active");
        document.body.style.overflow = "hidden"; 
        profileNameInput.focus();
    }

    function closeProfileModal(){
        profileModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    myProfileBtn.addEventListener("click",()=>{
        openProfileModal();
    });

    profileCloseBtn.addEventListener("click",closeProfileModal);
    profileCancelBtn.addEventListener("click",closeProfileModal);
    profileModal.addEventListener("click",(event)=>{
        if (event.target === profileModal){
            closeProfileModal();
        }
    });
    
    profileNameInput.addEventListener("input",updateProfilePreview);
    profileEmailInput.addEventListener("input",updateProfilePreview);

    profileForm.addEventListener("submit", async (event)=>{
        event.preventDefault();
        let name = capitalizeName(profileNameInput.value);
        let email = profileEmailInput.value.trim().toLowerCase();
        let emailChanged = email !== currentUser.email.toLowerCase();
        if (emailChanged){
            let password = profilePasswordInput.value;
            if (!password){
                profileMessage.textContent = "Enter your current password to change your email.";
                profileMessage.className = "profile-form-message error";
                profilePasswordInput.focus();
                return;
            }
            let passwordValid = await auth.verifyCurrentPassword(currentUser.id,password);
            if (!passwordValid){
                profileMessage.textContent = "Incorrect password. Please try again.";
                profileMessage.className = "profile-form-message error";
                profilePasswordInput.value = "";
                profilePasswordInput.focus();
                return;
            }
        }
        let result = auth.updateProfile(currentUser.id, name, email);
        profileMessage.textContent = result.message;
        profileMessage.className = result.success? "profile-form-message success": "profile-form-message error";

        if (!result.success){
            return;
        }
        currentUser.name = name;
        currentUser.email = email;
        firstLetter.textContent = name[0].toUpperCase();
        let currHour = new Date().getHours();
        let greeting = currHour < 12 ? "Good Morning" : currHour < 16 ? "Good Afternoon" : currHour < 19 ? "Good Evening" : "Good Night";
        welcomeMsg.textContent = `${greeting}, ${name}! ${currHour < 12 ? "☀️" : currHour < 19 ? "🌤️" : "🌙"}`;
        profilePasswordInput.value = "";
        profilePasswordField.hidden = true;
        profilePasswordInput.required = false;
        updateProfilePreview();
        setTimeout(closeProfileModal,1000);
    });

    function openExportModal(){
        exportMessage.textContent = "";
        exportMessage.className = "export-modal-message";
        exportModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
    function closeExportModal(){
        exportModal.classList.remove("active");
        document.body.style.overflow = "";
    }
    exportDataBtn.addEventListener("click",openExportModal);
    exportCloseBtn.addEventListener("click",closeExportModal);
    exportCancelBtn.addEventListener("click",closeExportModal);
    exportModal.addEventListener("click",(event)=>{
        if (event.target === exportModal){
            closeExportModal();
        }
    });
    exportFormat.addEventListener("change",()=>{
        if (exportFormat.value === "json"){
            exportFormatDescription.textContent = "Preserves your transaction data in a structured format.";
        }
        else{
            exportFormatDescription.textContent ="Opens easily in spreadsheet applications such as Excel.";
        }
    });

    let currHour = new Date().getHours();
    if (currHour < 12){
        welcomeMsg.textContent = `Good Morning, ${userName}! ☀️`;
    }
    else if (currHour < 16){
        welcomeMsg.textContent = `Good Afternoon, ${userName}! 🌤️`;
    }
    else if (currHour < 19){
        welcomeMsg.textContent = `Good Evening, ${userName}! 🌤️`;
    }
    else{
        welcomeMsg.textContent = `Good Night, ${userName}! 🌙`;
    }

    function getTransactions(){
        return JSON.parse(localStorage.getItem(transactionUserKey)) || [];
    }

    let monthSelect = document.querySelector("#month-select");
    let yearSelect = document.querySelector("#year-select");
    let currDate = new Date();
    let currYear = currDate.getFullYear();
    monthSelect.value = currDate.getMonth();
    for (let year=currYear-5;year<=currYear;year++){
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currYear;

    let profileDash = document.querySelector(".dashboard-profile");
    let profileBtn = document.querySelector(".profile-btn");
    let arrowLogo = document.querySelector(".arrow-logo");

    profileBtn.addEventListener("click",function(event){
        event.stopPropagation();
        profileDash.classList.toggle("open");
        arrowLogo.classList.toggle("turn");
    });

    document.addEventListener("click",function(event){
        if (!profileDash.contains(event.target)){
            profileDash.classList.remove("open");
            arrowLogo.classList.remove("turn");
        }
    });

    let profileDropOptions = document.querySelectorAll(".profile-drop-menu button");
    profileDropOptions.forEach((option)=>{
        option.addEventListener("click",function(){
            profileDash.classList.remove("open");
            arrowLogo.classList.remove("turn");
        });
    });

    function getFilteredTransactions(){
        let selectedYear = +yearSelect.value;
        let selectedMonth = +monthSelect.value;
        let allTransactions = getTransactions();
        let filteredTransactions = allTransactions.filter((transaction)=>{
            let transactionDate = new Date(transaction.date);
            let transactionMonth = transactionDate.getMonth();
            let transactionYear = transactionDate.getFullYear();
            return selectedMonth === transactionMonth && selectedYear === transactionYear;
        })
        return filteredTransactions;
    }

    function updateCategoryDot(rank,categoryName){
        let dot = document.getElementById(`top${rank}-dot`);
        if (!dot){
            return;
        }
        dot.style.backgroundColor = getCategory(categoryName).color;
    }

    exportDownloadBtn.addEventListener("click",()=>{
        let fetchedTransactions = getTransactions();
        if (fetchedTransactions.length === 0){
            exportMessage.textContent = "No transactions to export.";
            exportMessage.className = "export-modal-message error";
            return;
        }
        let fileContent;
        let fileType;
        let fileExtension;
        if (exportFormat.value === "json"){
            fileContent = JSON.stringify(fetchedTransactions,null,2);
            fileType = "application/json";
            fileExtension = "json";
        }
        else{
            let columns = ["id","title","amount","type","category","customCategory","date","notes"];
            function escapeCSV(value){
                let text = String(value ?? "");
                return `"${text.replace(/"/g,'""')}"`;
            }
            let header = columns.map(escapeCSV).join(",");
            let rows = fetchedTransactions.map(transaction=>{
                return columns.map(column=>{
                    return escapeCSV(transaction[column]);
                }).join(",");
            });
            fileContent = [header,...rows].join("\r\n");
            fileType = "text/csv;charset=utf-8;";
            fileExtension = "csv";
        }

        let file = new Blob([fileContent],{type:fileType});
        let fileUrl = URL.createObjectURL(file);
        let downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download =`transactions-${new Date().toISOString().slice(0,10)}.${fileExtension}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(fileUrl);
        exportMessage.textContent = "Transactions exported successfully.";
        exportMessage.className = "export-modal-message success";
    });

    function calculateCategorySpending(){
        let transactions = getFilteredTransactions();
        let categoryTotals = {};
        let filteredTransactions = transactions.filter((transaction)=>{
            return transaction.type === "expense";
        })
        filteredTransactions.forEach((transaction)=>{
            let categoryName = transaction.customCategory || transaction.category;
            categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + Number(transaction.amount);
        })
        return categoryTotals;
    }

    function getTopSpendingCategories(){
        let totalCategories = calculateCategorySpending();
        let arr = Object.entries(totalCategories);
        arr.sort((a,b)=> b[1] - a[1]);
        let firstFiveCategories = arr.slice(0,5);
        return firstFiveCategories;
    }

    function createTopSpendingCategories(){
        let topCategories = getTopSpendingCategories();
        let categoryTotals = calculateCategorySpending();
        updateSpendingChart(categoryTotals);
        let totalAmt = Object.values(categoryTotals).reduce((total,sum) => total+sum,0);
        for (let rank = 1; rank <= 5; rank++){
            let nameElement = document.getElementById(`top${rank}-name`);
            let amountElement = document.getElementById(`top${rank}-amount`);
            let percentageElement = document.getElementById(`top${rank}-percentage`);
            let category = topCategories[rank - 1];
            let categoryItem = nameElement.closest(".spending-category-item");
            if (!category){
                categoryItem.style.display = "none";
                continue;
            }
            categoryItem.style.display = "";
            let categoryName = category[0];
            let amount = category[1];
            let percentage = totalAmt > 0 ? (amount/totalAmt) * 100 : 0;
            nameElement.textContent = categoryName;
            amountElement.textContent = formatCurrency(amount);
            percentageElement.textContent = `${Math.round(percentage)}%`;
            updateCategoryDot(rank, categoryName);
        }
    }

    function calculateDashboardTotals(){
        let transactions = getFilteredTransactions();
        let totalIncome = transactions.filter(transaction => transaction.type === "income").reduce((total, transaction) => total + Number(transaction.amount), 0);
        let totalExpenses = transactions.filter(transaction => transaction.type === "expense").reduce((total, transaction) => total + Number(transaction.amount), 0);
        let totalSavings = transactions.filter(transaction => transaction.type === "savings").reduce((total, transaction) => total + Number(transaction.amount), 0);
        let balance = totalIncome - totalExpenses;
        let availableBalance = balance - totalSavings;
        return {
            totalIncome,
            totalExpenses,
            totalSavings,
            balance,
            availableBalance
        };
    }

    function updateDashboardStats(){
        let { totalIncome, totalExpenses, totalSavings, availableBalance } = calculateDashboardTotals();
        document.querySelector(".dashboard-income-amount").textContent = formatCurrency(totalIncome);
        document.querySelector(".dashboard-expense-amount").textContent = formatCurrency(totalExpenses);
        document.querySelector(".dashboard-balance-amount").textContent = formatCurrency(availableBalance);
        document.querySelector(".dashboard-savings-amount").textContent = formatCurrency(totalSavings);
        let balanceElement = document.querySelector(".dashboard-balance-amount");
        balanceElement.style.color = availableBalance < 0 ? "var(--expense-color)" : "";
        updateMonthlyKpiComparisons();
    }


    function updateSpendingEmptyState(){
        let transactions = getFilteredTransactions();
        let hasExpenses = transactions.some(transaction => transaction.type === "expense");
        let spendingPie = document.querySelector("#spending-pie-chart");
        let emptyState = document.querySelector("#spending-empty-state");
        let categoryList = document.querySelector(".spending-category-list");
        let chartContainer = document.querySelector(".spending-chart-container");
        emptyState.style.display = hasExpenses ? "none" : "flex";
        if (!hasExpenses){
            categoryList.querySelectorAll(".spending-category-item").forEach(item =>{
                item.style.display = "none";
            });
            chartContainer.style.width = "100%";
            categoryList.style.display = "none";
            categoryList.style.padding = "0";
            spendingPie.style.display = "none";
        } 
        else{
            categoryList.querySelectorAll(".spending-category-item").forEach(item =>{
                item.style.display = "";
            });
            chartContainer.style.width = "";
            categoryList.style.display = "";
            categoryList.style.padding = "";
            spendingPie.style.display = "";
        }
    }

    function updateMonthlySummaryEmptyState(){
        let transactions = getFilteredTransactions();
        let canvas = document.querySelector("#monthly-summary-canvas");
        let emptyState = document.querySelector("#monthly-summary-empty");
        if (transactions.length === 0){
            emptyState.style.display = "flex";
            canvas.style.display = "none";
        } 
        else {
            emptyState.style.display = "none";
            canvas.style.display = "";
        }
    }

    function getBudgetSpent(budget, transactions){
    return transactions.filter(transaction => {
                let [year, month] = transaction.date.split("-").map(Number);
                return transaction.type === "expense" &&
                    transaction.category === budget.category &&(budget.category !== "Others" ||(transaction.customCategory || "").trim().toLowerCase() ===(budget.customCategory || "").trim().toLowerCase()) &&
                    year === budget.year &&
                    month === budget.month + 1;
            })
            .reduce((total, transaction) => total + Number(transaction.amount), 0);
    }

    function capitalizeName(name) {
        name = name.trim();
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function createBudgetOverview(){
        let budgetList = document.querySelector("#budget-category-list");
        let emptyState = document.querySelector("#budget-empty-state");
        let currentUser = auth.getCurrentUser();
        if (!budgetList || !currentUser){
            return;
        }
        let budgets = JSON.parse(localStorage.getItem(`budgets_${currentUser.id}`) || "[]");
        let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`) || "[]");
        let currentBudgets = budgets.filter(budget =>Number(budget.month) === Number(monthSelect.value) &&Number(budget.year) === Number(yearSelect.value)).map(budget => ({...budget,spent: getBudgetSpent(budget, transactions)})).sort((a, b) => b.spent - a.spent).slice(0, 5);
        budgetList.innerHTML = "";
        if (currentBudgets.length > 0) {
            budgetList.style.display = "flex";
            if (emptyState) {
                emptyState.style.display = "none";
            }
        } 
        else {
            budgetList.style.display = "none";
            if (emptyState) {
                emptyState.style.display = "flex";
            }
        }
        currentBudgets.forEach(budget => {
            let category = getCategory(budget.category);
            let percentage = budget.amount > 0? Math.round(budget.spent / budget.amount * 100): 0;
            budgetList.insertAdjacentHTML("beforeend", `
                <div class="budget-category-item">
                    <span class="budget-category-icon"
                        style="color:${category.color};background:${category.background}">
                        <i class="${category.icon}"></i>
                    </span>
                    <span class="budget-category-name">
                        ${budget.customCategory || budget.category}
                    </span>
                    <div class="budget-progress">
                        <div class="budget-progress-fill"
                            style="width:${Math.min(percentage, 100)}%;background:${percentage > 100 ? "var(--expense-color)" : category.color}">
                        </div>
                    </div>
                    <span class="budget-amount">
                        ${formatCurrency(budget.spent)} / ${formatCurrency(budget.amount)}
                    </span>
                    <span class="budget-percentage">${percentage}%</span>
                </div>
            `);
        });
    }

    function createFinancialGoals() {
        let currentUser = auth.getCurrentUser();
        let goalsList = document.querySelector("#financial-goals-list");

        if (!goalsList || !currentUser) {
            return;
        }
        let goals = JSON.parse(
            localStorage.getItem(`financialGoals_${currentUser.id}`) || "[]"
        );
        goalsList.innerHTML = "";
        if (goals.length === 0) {
            goalsList.innerHTML = `
                <div id="financial-goals-empty" class="dashboard-empty-state">
                    <i class="fa-solid fa-bullseye"></i>
                    <p>No financial goals yet</p>
                    <span>Create a goal to start tracking your savings progress.</span>
                </div>
            `;
            return;
        }
        goals.forEach(function(goal) {
            let savedAmount = Number(goal.savedAmount) || 0;
            let targetAmount = Number(goal.targetAmount) || 0;
            let actualProgress = targetAmount > 0? Math.round(savedAmount / targetAmount * 100): 0;
            let progress = Math.min(100,actualProgress);
            let barColor = actualProgress < 80? "var(--warning-color)":"var(--primary-color)";
            let status = "In progress";
            let statusClass = "active";
            if (targetAmount > 0 && savedAmount >= targetAmount){
                status = "Completed";
                statusClass = "completed";
            } 
            else if(goal.targetDate && new Date(goal.targetDate+"T00:00:00") < new Date(new Date().setHours(0,0,0,0))){
                status = "Behind schedule";
                statusClass = "delayed";
            }
            let card = document.createElement("div");
            card.className = "financial-goal-item";
            card.innerHTML = `
                <div class="financial-goal-icon">
                    <i class="fa-solid"></i>
                </div>

                <div class="financial-goal-content">
                    <h5></h5>

                    <div class="financial-goal-progress-row">
                        <div class="financial-goal-track">
                            <div class="financial-goal-fill" style="width: ${progress}%; background: ${barColor};"></div>
                        </div>
                        <span class="financial-goal-percentage">${progress}%</span>
                    </div>

                    <p class="financial-goal-amount"></p>
                </div>
            `;

            card.querySelector(".financial-goal-icon i").className =`fa-solid ${goal.icon || "fa-bullseye"}`;
            card.querySelector(".financial-goal-content h5").textContent =goal.name || "Untitled Goal";
            card.querySelector(".financial-goal-amount").textContent =`${formatCurrency(savedAmount)} / ${formatCurrency(targetAmount)}`;

            goalsList.appendChild(card);
        });
    }


    function getMonthTransactions(year, month){
        return getTransactions().filter(transaction =>{
            let [transactionYear,transactionMonth] =transaction.date.split("-").map(Number);

            return transactionYear === year && transactionMonth === month + 1;
        });
    }

    function getMonthTotals(year, month) {
        let transactions = getMonthTransactions(year, month);
        let income = 0;
        let expenses = 0;
        let savings = 0;

        transactions.forEach(transaction => {
            let amount = Number(transaction.amount) || 0;

            if (transaction.type === "income"){
                income += amount;
            } 
            else if (transaction.type === "expense"){
                expenses += amount;
            } 
            else if (transaction.type === "savings"){
                savings += amount;
            }
        });

        return {
            income,
            expenses,
            savings,
            balance: income - expenses - savings,
            transactionCount: transactions.length
        };
    }

    function updateKpiComparison(elementId, current, previous, type) {
        let element = document.getElementById(elementId);
        if (!element){
            return;
        }

        let comparisonText =element.parentElement.querySelector(".kpi-comparison-text");

        element.className = "kpi-percentages";
        element.textContent = "";

        if (comparisonText) {
            comparisonText.textContent = "";
        }
        if (current.transactionCount === 0 || previous.transactionCount === 0 ||previous[type] === 0){
            return;
        }

        let change = ((current[type] - previous[type]) / Math.abs(previous[type])) * 100;
        let direction = change > 0 ? "↑" : change < 0 ? "↓" : "→";
        let percentage = Math.abs(change).toFixed(1);

        element.textContent = `${direction} ${percentage}%`;
        if (change === 0) {
            element.classList.add("same");
        } 
        else {
            let favorable = type === "expenses"? change < 0: change > 0;
            element.classList.add(favorable ? "positive" : "negative");
        }

        if (comparisonText) {
            comparisonText.textContent = "vs prev. month";
        }
    }

    function updateMonthlyKpiComparisons(){
        let year = Number(yearSelect.value);
        let month = Number(monthSelect.value);

        let current = getMonthTotals(year,month);

        let previousDate = new Date(year,month-1,1);
        let previous = getMonthTotals(
            previousDate.getFullYear(),
            previousDate.getMonth()
        );

        updateKpiComparison("dashboard-kpi-income-percentage", current, previous, "income");
        updateKpiComparison("dashboard-kpi-expense-percentage", current, previous, "expenses");
        updateKpiComparison("dashboard-kpi-savings-percentage", current, previous, "savings");
        updateKpiComparison("dashboard-kpi-balance-percentage", current, previous, "balance");
    }

    function updateSmartTip(){
        let smartTip = document.querySelector("#smart-tip-description");
        let year = Number(yearSelect.value);
        let month = Number(monthSelect.value);
        let current = getMonthTotals(year,month);
        let previousDate = new Date(year,month-1,1);
        let previous = getMonthTotals( previousDate.getFullYear(),previousDate.getMonth());
        let transactions = getMonthTransactions(year,month);
        let expenseTransactions = transactions.filter(
            transaction => transaction.type === "expense"
        );

        if (current.transactionCount === 0) {
            smartTip.textContent ="Start recording your income and expenses to unlock personalized financial insights.";
            return;
        }
        if (current.expenses > current.income && current.income > 0) {
            smartTip.textContent = `Your expenses exceed your income by ${formatCurrency(current.expenses - current.income)}. Review non-essential spending to bring your budget back on track.`;
            return;
        }

        let categoryTotals = {};
        expenseTransactions.forEach(transaction => {
            let category =transaction.customCategory || transaction.category || "Other";
            categoryTotals[category] = (categoryTotals[category] || 0) + (Number(transaction.amount) || 0);
        });

        let topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (previous.transactionCount > 0 && previous.expenses > 0) {
            let expenseChange = ((current.expenses - previous.expenses) /previous.expenses) * 100;
            if (expenseChange >= 15) {
                smartTip.textContent = `Your expenses increased by ${Math.round(expenseChange)}% compared with last month. Review recent purchases and identify expenses you can reduce.`;
                return;
            }
            if (expenseChange <= -15) {
                smartTip.textContent = `Great progress! Your expenses decreased by ${Math.round(Math.abs(expenseChange))}% compared with last month. Consider directing some of the difference toward your savings goals.`;
                return;
            }
        }
        if (topCategory && current.expenses > 0) {
            let categoryPercentage = (topCategory[1] / current.expenses) * 100;
            if (categoryPercentage >= 40) {
                smartTip.textContent = `${topCategory[0]} accounts for ${Math.round(categoryPercentage)}% of your expenses. Review this category for realistic savings opportunities.`;
                return;
            }
        }

        if (current.income > 0) {
            let savingsRate = (current.savings / current.income) * 100;
            if (savingsRate >= 20) {
                smartTip.textContent = `You're saving ${Math.round(savingsRate)}% of your income. Keep building your financial cushion while working toward your goals.`;
                return;
            }
            if (current.savings === 0) {
                smartTip.textContent = "You haven't recorded any savings this month. Consider setting aside a manageable amount after covering essential expenses.";
                return;
            }
        }

        if (topCategory) {
            smartTip.textContent = `${topCategory[0]} is your largest expense at ${formatCurrency(topCategory[1])}. Keep tracking it to understand your spending patterns.`;
        } 

        else {
            smartTip.textContent = "Keep tracking your income, expenses, and savings to build a clearer picture of your finances.";
        }
    }

    let transactionBtn = document.querySelector("#transaction-btn");
    let viewAllTransactions = document.querySelector("#view-all-transactions");
    viewAllTransactions.addEventListener("click",function(event){
        event.preventDefault();
        transactionBtn.click();
    })

    let budgetBtn = document.querySelector("#budgets-btn");
    let viewAllBudgets = document.querySelector("#view-all-budgets");
    viewAllBudgets.addEventListener("click",function(event){
        event.preventDefault();
        budgetBtn.click();
    })

    function createRecentTransactions(){
        let transactions = getFilteredTransactions();
        let recentTransactionCont = document.querySelector("#recent-transactions-list");
        let emptyState = document.querySelector("#recent-transactions-empty");
        let recentTransactions = [...transactions].sort((a,b)=>{
            return b.date.localeCompare(a.date);
        }).slice(0,3);
        if (recentTransactions.length === 0){
            emptyState.style.display = "flex";
        } 
        else{
            emptyState.style.display = "none";
        }
        let existingRows = recentTransactionCont.querySelectorAll(".recent-transaction-row");
        existingRows.forEach((row)=>{
            row.remove();
        })
        recentTransactions.forEach(transaction => {
            let transactionCategory = getCategory(transaction.category);
            let sign = transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : "";
            let formattedAmount = formatCurrency(transaction.amount);
            let date = new Date(transaction.date).toLocaleDateString("en-US",{
                month:"short",
                day:"2-digit",
                year:"numeric" 
            })
            let row = 
                `<div class="recent-transaction-row">
                    <div class="transaction-icon" style="background:${transactionCategory.background};color:${transactionCategory.color}">
                        <i class="${transactionCategory.icon}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.title}</div>
                        <div class="transaction-meta">${date}</div>
                    </div>
                    <p class="transaction-amount ${transaction.type === "income" ? "transaction-income" :transaction.type === "savings" ? "transaction-savings" :"transaction-expense"}">${sign} ${formattedAmount}</p>
                </div>`;
            recentTransactionCont.insertAdjacentHTML("beforeend",row);
        })
    }

    monthSelect.addEventListener("change",()=>{
        updateDashboardStats();
        updateSpendingEmptyState();
        createRecentTransactions();
        updateMonthlySummaryEmptyState();
        createTopSpendingCategories();
        createBudgetOverview();
        updateSmartTip();
    });

    yearSelect.addEventListener("change",()=>{
        updateDashboardStats();
        createRecentTransactions();
        updateSpendingEmptyState();
        updateMonthlySummaryEmptyState();
        createTopSpendingCategories();
        createBudgetOverview();
        updateSmartTip();
        updateMonthlySummary(getTransactions(), yearSelect.value);
    });

    profileEmailInput.addEventListener("input",()=>{
        let emailChanged = profileEmailInput.value.trim().toLowerCase() !== currentUser.email.toLowerCase();
        profilePasswordField.hidden = !emailChanged;
        profilePasswordInput.required = emailChanged;
        if (!emailChanged){
            profilePasswordInput.value = "";
        }
        updateProfilePreview();
    });

    updateDashboardStats();
    updateSpendingEmptyState();
    updateMonthlySummaryEmptyState();
    updateMonthlySummary(getTransactions(),yearSelect.value);
    createTopSpendingCategories();
    createBudgetOverview();
    updateSmartTip();
    createFinancialGoals();
    createRecentTransactions();
    window.addEventListener("transactions-updated",function(){
        updateDashboardStats();
        updateSpendingEmptyState();
        updateMonthlySummaryEmptyState();
        updateMonthlySummary(getTransactions(), yearSelect.value);
        updateSmartTip();
        createRecentTransactions();
        createTopSpendingCategories();
        createBudgetOverview()
        createFinancialGoals();
    });
    window.addEventListener("budgets-updated", () => {
        createBudgetOverview();
    });
    window.addEventListener("financial-goals-updated", function() {
        createFinancialGoals();
    });
    window.addEventListener("theme-changed", function(){
        createRecentTransactions();
        createBudgetOverview();
    });
}