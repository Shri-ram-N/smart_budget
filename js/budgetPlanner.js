import {getCategory} from "./categoryConfig.js";
import {formatCurrency} from "./utils.js";
import {getCurrentUser} from "./auth.js";

export function initBudgetPlanner(){

    let currentUser = getCurrentUser();
    if (!currentUser){
        window.location.href = "auth.html";
        return;
    }
    let currentUserId = currentUser.id;
    let budgetUserKey = `budgets_${currentUserId}`;
    let budgets = [];
    let fetchedTransactions = [];
    let selectedBudgetStatus = "all";
    try{
        budgets = JSON.parse(localStorage.getItem(budgetUserKey));
        if (!Array.isArray(budgets)){
            budgets = [];
        }
    }
    catch(e){
        console.error(e);
        budgets = [];
    }

    function loadTransactions(){
        let transactionUserKey = `transactions_${currentUserId}`;
        try{
            fetchedTransactions = JSON.parse(localStorage.getItem(transactionUserKey));
            if (!Array.isArray(fetchedTransactions)){
                fetchedTransactions = [];
            }
        }
        catch(e){
            console.error(e);
            fetchedTransactions = [];
        }
    }
    loadTransactions();

    let monthSelect = document.querySelector("#month-selection");
    let yearSelect = document.querySelector("#year-selection");
    let budgetMonthSelect = document.querySelector("#budget-month");
    let budgetYearSelect = document.querySelector("#budget-year");
    let addNewBudgetBtn = document.querySelector("#add-budget");
    let budgetOverlay = document.querySelector("#budget-modal-overlay");
    let closeBudgetOverlay = document.querySelector("#close-budget-modal");
    let cancelBudgetOverlay = document.querySelector("#cancel-budget-btn");
    let budgetForm = document.querySelector("#budget-form");
    let budgetCategory = document.querySelector("#budget-category");
    let budgetAmt = document.querySelector("#budget-amount");
    let budgetCustomCategoryField = document.querySelector("#budget-custom-category-field");
    let budgetCustomCategoryName = document.querySelector("#budget-custom-category-name");
    let budgetMonth = document.querySelector("#budget-month");
    let budgetYear = document.querySelector("#budget-year");
    let budgetCategoryCont = document.querySelector("#budget-category-cont");
    let budgetCategoryEmpty = document.querySelector("#budget-categories-empty");
    let totalBudgetAmount = document.querySelector("#total-budget-amount");
    let totalSpentAmount = document.querySelector("#total-spent-amount");
    let totalSpentProgress = document.querySelector("#total-spent-progress");
    let remainingBudgetAmount = document.querySelector("#remaining-budget-amount");
    let remainingBudgetProgress = document.querySelector("#remaining-budget-progress");
    let overBudgetCount = document.querySelector("#over-budget-count");
    let budgetDeleteOverlay = document.querySelector("#budget-delete-overlay");
    let cancelDeleteBudgetBtn = document.querySelector("#cancel-delete-budget-btn");
    let confirmDeleteBudgetBtn = document.querySelector("#confirm-delete-budget-btn");
    let budgetFilterBtns = document.querySelectorAll(".budget-filter-btn");
    let copyPreviousMonthBtn = document.querySelector(".copy-previous-month-btn");

    let currDate = new Date();
    let currYear = currDate.getFullYear();

    function toggleBudgetCustomCategoryField(){
        let isOthers = budgetCategory.value === "Others";
        budgetCustomCategoryField.hidden = !isOthers;
        budgetCustomCategoryName.required = isOthers;
        if (!isOthers) {
            budgetCustomCategoryName.value = "";
        }
    }

    budgetCategory.addEventListener("change", toggleBudgetCustomCategoryField);
    toggleBudgetCustomCategoryField();
    monthSelect.value = currDate.getMonth();
    for (let year = currYear - 5; year <= currYear + 1; year++){
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currYear;
    for (let year = currYear - 5; year <= currYear + 1; year++){
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        budgetYearSelect.appendChild(option);
    }
    budgetYearSelect.value = currYear;
    budgetMonthSelect.value = currDate.getMonth();

    addNewBudgetBtn.addEventListener("click",()=>{
        budgetMonth.value = currDate.getMonth();
        budgetYear.value = currYear;
        document.querySelector("#budget-modal-title").textContent = "Add Budget";
        document.querySelector("#budget-id").value = "";
        budgetOverlay.classList.add("show");
    })

    closeBudgetOverlay.addEventListener("click",()=>{
        budgetOverlay.classList.remove("show");
    })

    cancelBudgetOverlay.addEventListener("click",()=>{
        budgetOverlay.classList.remove("show");
    })

    budgetOverlay.addEventListener("click",(event)=>{
        if (event.target === budgetOverlay){
            budgetOverlay.classList.remove("show");
        }
    })

    budgetForm.addEventListener("submit",(event)=>{
        event.preventDefault();
        let editingBudgetId = document.querySelector("#budget-id").value;
        let category = budgetCategory.value;
        let amt = +budgetAmt.value;
        let month = +budgetMonth.value;
        let year = +budgetYear.value;
        let customCategory = category === "Others" ? budgetCustomCategoryName.value.trim() : "";
        if (editingBudgetId){
            let budgetFound = budgets.find((budget)=>{
                return budget.id === editingBudgetId;
            })
            let alreadyCreatedBudget = budgets.some((budget)=>{
                return (
                    budget.id !== editingBudgetId &&
                    budget.category === category &&
                    (budget.customCategory || "").trim().toLowerCase() === customCategory.toLowerCase() &&
                    budget.month === month &&
                    budget.year === year
                );
            });
            if (alreadyCreatedBudget){
                alert("Budget for this category in this month has already been created!");
                return;
            }
            if (!budgetFound) {
                console.error("Budget not found:",editingBudgetId);
                return;
            }
            budgetFound.category = category;
            budgetFound.amount = amt;
            budgetFound.month = month;
            budgetFound.year = year;
            budgetFound.customCategory = customCategory;
        }
        else{
            let id = crypto.randomUUID();
            let newBudget = {
                id: id,
                category: category,
                customCategory: customCategory,
                amount: amt,
                month: month,
                year: year
            }
            let alreadyCreatedBudget = budgets.some((budget)=>{
                return (
                    budget.category === newBudget.category && (budget.customCategory || "").trim().toLowerCase() === (newBudget.customCategory || "").trim().toLowerCase() &&
                    budget.month === newBudget.month &&
                    budget.year === newBudget.year
                );
            });
            if (alreadyCreatedBudget){
                alert("Budget for this category in this month has already been created!");
                return;
            }
            budgets.push(newBudget);
        }
        
        localStorage.setItem(budgetUserKey,JSON.stringify(budgets));
        window.dispatchEvent(new Event("budgets-updated"));
        createBudgets();
        budgetForm.reset();
        toggleBudgetCustomCategoryField();
        budgetOverlay.classList.remove("show");
    })

    function createBudgets(){
        budgetCategoryCont.innerHTML = "";
        let currentShowingCards = budgets.filter((budget)=>{
            return (budget.month === +monthSelect.value && budget.year === +yearSelect.value);
        })

        if(budgets.length === 0){
            budgetCategoryCont.style.display = "none";
            budgetCategoryEmpty.style.display = "flex";
        }
        else if (currentShowingCards.length === 0){
            budgetCategoryEmpty.style.display = "none";
            budgetCategoryCont.style.display = "block";
            budgetCategoryCont.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 0;">
                    <i class="fa-regular fa-calendar" style="font-size: 28px; color: var(--text-muted);"></i>
                    <p style="margin-top: 10px; color: var(--text-secondary);">
                        No budgets found for the selected month.
                    </p>
                </div>`;
        }
        else{
            budgetCategoryEmpty.style.display = "none";
            budgetCategoryCont.style.display = "grid";
        }

        let totalBudget = currentShowingCards.reduce((total,budget)=>{
            return total + budget.amount;
        }, 0)

        totalBudgetAmount.textContent = formatCurrency(totalBudget);
        let totalSpent = 0;
        let overSpent = 0;
        currentShowingCards.forEach((budget)=>{
            let categoryConfig = getCategory(budget.category);
            let spent = fetchedTransactions.filter((transaction)=>{
                let [year, month] = transaction.date.split("-").map(Number);
                let sameCustomCategory = budget.category !== "Others" || (transaction.customCategory || "").trim().toLowerCase() === (budget.customCategory || "").trim().toLowerCase();
                return (
                    transaction.type === "expense" &&
                    transaction.category === budget.category &&
                    sameCustomCategory &&
                    year === budget.year &&
                    month === budget.month + 1
                );
            }).reduce((total, transaction)=>{
                return total + transaction.amount;
            }, 0);
            totalSpent += spent;
            if (spent > budget.amount){
                overSpent++;
            }
            let remaining = budget.amount - spent;
            let percentage = (budget.amount !== 0) ? (spent/budget.amount)*100 : 0;
            let budgetStatus = "on-track";
            if (percentage >= 80 && percentage <= 100){
                budgetStatus = "near-limit";
            }
            else if (percentage > 100){
                budgetStatus = "over-budget";
            }
            if (selectedBudgetStatus !== "all" && selectedBudgetStatus !== budgetStatus){
                return;
            }
            let barColor = percentage < 80 ? "var(--primary-color)" : percentage <= 100 ? "var(--warning-color)" : "var(--expense-color)";
            let budgetCard = document.createElement("div");
            budgetCard.classList.add("budget-category-card");
            budgetCard.innerHTML = `
                <div class="budget-category-card-header">
                    <span style="color: ${categoryConfig.color}; background: ${categoryConfig.background};"><i class="${categoryConfig.icon}"></i></span>
                    <h3>${budget.customCategory || budget.category}</h3>
                    <button type="button" class="budget-edit-btn" data-id="${budget.id}"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="budget-delete-btn" data-id="${budget.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
                <p>Budget Limit</p>
                <h3>${formatCurrency(budget.amount)}</h3>
                <div class="budget-category-spending">
                    <span>Spent: ${formatCurrency(spent)}</span>
                    <span style="color: ${remaining < 0 ? "var(--expense-color)" : "var(--text-secondary)"}">
                        ${remaining >= 0 ? `Remaining: ${formatCurrency(remaining)}` : `Over by ${formatCurrency(Math.abs(remaining))}`}
                    </span>
                </div>
                <div class="budget-category-progress">
                    <span style="color: ${percentage > 100 ? "var(--expense-color)" : "var(--text-secondary)"}">${percentage.toFixed(0)}% used${percentage > 100 ? " · Over Budget" : ""}</span>
                    <div class="budget-category-progress-track">
                        <div style="width: ${Math.min(percentage,100)}%; background: ${barColor}"></div>
                    </div>
                </div>`;
            budgetCategoryCont.append(budgetCard);
        })
        if (currentShowingCards.length > 0 && budgetCategoryCont.children.length === 0){
            let emptyMessage = selectedBudgetStatus === "on-track" ? "No on-track budgets found." : selectedBudgetStatus === "near-limit" ? "No budgets near their limit." : "No over-budget categories found.";
            budgetCategoryCont.style.display = "block";
            budgetCategoryCont.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 0;">
                    <i class="fa-solid fa-filter" style="font-size: 28px; color: var(--text-muted);"></i>
                    <p style="margin-top: 10px; color: var(--text-secondary);">${emptyMessage}</p>
                </div>`;
        }
        totalSpentAmount.textContent = formatCurrency(totalSpent);
        let spentPercentage = totalBudget > 0? (totalSpent / totalBudget) * 100: 0;
        totalSpentProgress.style.width = `${Math.min(spentPercentage, 100)}%`;
        totalSpentProgress.style.backgroundColor = spentPercentage > 100? "var(--expense-color)": "var(--info-color)";
        let totalremaining = totalBudget - totalSpent;
        remainingBudgetAmount.textContent = formatCurrency(totalremaining);
        let isOverBudget = totalSpent > totalBudget;
        totalSpentAmount.style.color = isOverBudget? "var(--expense-color)": "var(--text-primary)";
        remainingBudgetAmount.style.color = isOverBudget? "var(--expense-color)": "var(--text-primary)";
        let remainingPercentage = totalBudget > 0 ? (totalremaining / totalBudget) * 100: 0;
        remainingBudgetProgress.style.width = isOverBudget? "100%": `${Math.min(remainingPercentage, 100)}%`;
        remainingBudgetProgress.style.backgroundColor = isOverBudget? "var(--expense-color)": "var(--warning-color)";
        overBudgetCount.textContent = overSpent;
    }

    let addFirstBudgetBtn = document.querySelector("#empty-add-budget");

    if (addFirstBudgetBtn){
        addFirstBudgetBtn.addEventListener("click",()=>{
            addNewBudgetBtn.click();
        });
    }

    budgetCategoryCont.addEventListener("click",(event)=>{
        let clickedBtn = event.target.closest(".budget-edit-btn");
        if (!clickedBtn){
            return;
        }
        let clickedBtnId = clickedBtn.dataset.id;
        let foundBudget = budgets.find((budget)=>{
            return budget.id === clickedBtnId;
        })
        if (foundBudget){
            document.querySelector("#budget-id").value = foundBudget.id;
            budgetCategory.value = foundBudget.category;
            budgetAmt.value = foundBudget.amount;
            budgetMonth.value = foundBudget.month;
            budgetYear.value = foundBudget.year;
            budgetCustomCategoryName.value = foundBudget.customCategory || "";
            toggleBudgetCustomCategoryField();
            document.querySelector("#budget-modal-title").textContent = "Edit Budget";
            budgetOverlay.classList.add("show");
        }
    });


    let selectedBudgetId = "";
    budgetCategoryCont.addEventListener("click",(event)=>{
        let clickedBtn = event.target.closest(".budget-delete-btn");
        if (!clickedBtn){
            return;
        }
        selectedBudgetId = clickedBtn.dataset.id;
        budgetDeleteOverlay.classList.add("show");
    });

    cancelDeleteBudgetBtn.addEventListener("click",()=>{
        budgetDeleteOverlay.classList.remove("show");
        selectedBudgetId = "";
    });
    budgetDeleteOverlay.addEventListener("click",(event)=>{
        if (event.target === budgetDeleteOverlay){
            budgetDeleteOverlay.classList.remove("show");
            selectedBudgetId = "";
        }
    });
    confirmDeleteBudgetBtn.addEventListener("click",()=>{
        if (!selectedBudgetId){
            return;
        }
        budgets = budgets.filter((budget)=>{
            return budget.id !== selectedBudgetId;
        });
        localStorage.setItem(budgetUserKey,JSON.stringify(budgets));
        window.dispatchEvent(new Event("budgets-updated"));
        createBudgets();
        budgetDeleteOverlay.classList.remove("show");
        selectedBudgetId = "";
    });

    createBudgets();
    monthSelect.addEventListener("change",createBudgets);
    yearSelect.addEventListener("change",createBudgets);
    budgetFilterBtns.forEach((button)=>{
    button.addEventListener("click",()=>{
            budgetFilterBtns.forEach((filterBtn)=>{
                filterBtn.classList.remove("active");
            });
            button.classList.add("active");
            selectedBudgetStatus = button.dataset.status;
            createBudgets();
        });
    });
    window.addEventListener("transactions-updated",()=>{
        loadTransactions();
        createBudgets();
    });
    copyPreviousMonthBtn.addEventListener("click",()=>{
        let month = +monthSelect.value;
        let year = +yearSelect.value;
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 0){
            prevMonth = 11;
            prevYear--;
        }
        let prevBudgets = budgets.filter((budget)=>{
            return budget.month === prevMonth && budget.year === prevYear;
        });
        if (prevBudgets.length === 0){
            alert("No budgets found in the previous month.");
            return;
        }
        let copied = 0;
        let skipped = 0;
        prevBudgets.forEach((budget)=>{
            let exists = budgets.some((item)=>{
                return (
                    item.category === budget.category &&
                    (item.customCategory || "").trim().toLowerCase() === (budget.customCategory || "").trim().toLowerCase() &&
                    item.month === month &&
                    item.year === year
                );
            });
            if (exists){
                skipped++;
                return;
            }
            let newBudget ={
                id: crypto.randomUUID(),
                category: budget.category,
                customCategory: budget.customCategory || "",
                amount: budget.amount,
                month: month,
                year: year
            };
            budgets.push(newBudget);
            copied++;
        });
        if (copied > 0){
            localStorage.setItem(budgetUserKey, JSON.stringify(budgets));
            window.dispatchEvent(new Event("budgets-updated"));
            createBudgets();
        }
        alert(`${copied} budget(s) copied. ${skipped} skipped because they already exist.`);
    });
}
