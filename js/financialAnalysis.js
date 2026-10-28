import * as auth from "./auth.js";
import { formatCurrency } from "./utils.js";

export function initFinancialAnalysis(){
    let currentMonthSelect = document.querySelector("#analysis-current-month");
    let previousMonthSelect = document.querySelector("#analysis-previous-month");
    let generateAnalysisBtn = document.querySelector("#generate-analysis-btn");
    let resetAnalysisBtn = document.querySelector("#reset-analysis-btn");
    let analysisStatusText = document.querySelector("#analysis-status-text");
    let expenseChangeValue = document.querySelector("#analysis-expense-change-value");
    let expenseChangeText = document.querySelector("#analysis-expense-change-text");
    let savingsChangeValue = document.querySelector("#analysis-savings-change-value");
    let savingsChangeText = document.querySelector("#analysis-savings-change-text");
    let categoryList = document.querySelector("#analysis-category-list");
    let topChangesList = document.querySelector("#analysis-top-changes-list");
    let insightsCont = document.querySelector("#analysis-insights-cont");
    let actionsCont = document.querySelector("#analysis-actions-cont");

    if(!currentMonthSelect || !previousMonthSelect || !generateAnalysisBtn){
        return;
    }

    function loadMonthOptions(){
        let today = new Date();
        currentMonthSelect.innerHTML = "";
        previousMonthSelect.innerHTML = "";
        for(let i = 0;i < 12;i++){
            let date = new Date(today.getFullYear(),today.getMonth() - i,1);
            let year = date.getFullYear();
            let month = String(date.getMonth() + 1).padStart(2,"0");
            let monthValue = `${year}-${month}`;
            let monthText = date.toLocaleDateString("en-IN",{
                month:"long",
                year:"numeric"
            });
            currentMonthSelect.innerHTML += `<option value="${monthValue}">${monthText}</option>`;
            previousMonthSelect.innerHTML += `<option value="${monthValue}">${monthText}</option>`;
        }
        if(previousMonthSelect.options.length > 1){
            previousMonthSelect.selectedIndex = 1;
        }
    }

    function getTransactions(){
        let currentUser = auth.getCurrentUser();
        if(!currentUser){
            return [];
        }
        try{
            let transactionKey = `transactions_${currentUser.id}`;
            let transactions = JSON.parse(localStorage.getItem(transactionKey)) || [];
            if(Array.isArray(transactions)){
                return transactions;
            }
            return [];
        }
        catch(error){
            console.log("Unable to read transactions",error);
            return [];
        }
    }

    function getMonthTransactions(transactions,selectedMonth){
        let monthTransactions = [];
        transactions.forEach(function(transaction){
            if(transaction.date && transaction.date.startsWith(selectedMonth)){
                monthTransactions.push(transaction);
            }
        });
        return monthTransactions;
    }

    function calculateSummary(transactions){
        let income = 0;
        let expenses = 0;
        let categories = {};
        let expenseCount = 0;
        transactions.forEach(function(transaction){
            let amount = Number(transaction.amount);
            if(!Number.isFinite(amount) || amount < 0){
                return;
            }
            if(transaction.type === "income"){
                income += amount;
            }
            else if(transaction.type === "expense"){
                expenses += amount;
                expenseCount++;
                let category = transaction.customCategory || transaction.category || "Others";
                if(categories[category]){
                    categories[category] += amount;
                }
                else{
                    categories[category] = amount;
                }
            }
        });

        let savingsRate = null;
        if(income > 0){
            savingsRate = ((income - expenses) / income) * 100;
        }
        return {
            income:income,
            expenses:expenses,
            savingsRate:savingsRate,
            categories:categories,
            expenseCount:expenseCount,
            transactionCount:transactions.length
        };
    }

    function formatMonth(monthValue){
        let parts = monthValue.split("-");
        let year = Number(parts[0]);
        let month = Number(parts[1]);
        return new Date(year,month - 1).toLocaleDateString("en-IN",{
            month:"long",
            year:"numeric"
        });
    }

    function getChange(current,previous){
        if(previous === 0){
            if(current === 0){
                return 0;
            }
            return null;
        }
        return ((current - previous) / previous) * 100;
    }

    function displayExpenseChange(currentSummary,previousSummary){
        let current = currentSummary.expenses;
        let previous = previousSummary.expenses;
        let difference = current - previous;
        let change = getChange(current,previous);

        if(change === null){
            expenseChangeValue.textContent = "New";
            expenseChangeText.textContent = "Expenses were zero in the previous month.";
            return;
        }

        if(change > 0){
            expenseChangeValue.textContent = `+${change.toFixed(1)}%`;
        }
        else{
            expenseChangeValue.textContent = `${change.toFixed(1)}%`;
        }

        if(difference > 0){
            expenseChangeText.textContent =`Expenses increased by ${formatCurrency(difference)}.`;
        }
        else if(difference < 0){
            expenseChangeText.textContent =`Expenses decreased by ${formatCurrency(Math.abs(difference))}.`;
        }
        else{
            expenseChangeText.textContent = "Your total expenses remained unchanged.";
        }
    }

    function displaySavingsChange(currentSummary,previousSummary){
        let current = currentSummary.savingsRate;
        let previous = previousSummary.savingsRate;
        if(current === null || previous === null){
            savingsChangeValue.textContent = "--";
            savingsChangeText.textContent ="Income is needed in both months to compare savings rates.";
            return;
        }

        let difference = current - previous;
        if(difference > 0){
            savingsChangeValue.textContent = `+${difference.toFixed(1)} pp`;
            savingsChangeText.textContent = `Your savings rate improved by ${difference.toFixed(1)} percentage points.`;
        }
        else if(difference < 0){
            savingsChangeValue.textContent = `${difference.toFixed(1)} pp`;
            savingsChangeText.textContent = `Your savings rate fell by ${Math.abs(difference).toFixed(1)} percentage points.`;
        }
        else{
            savingsChangeValue.textContent = "0.0 pp";
            savingsChangeText.textContent = "Your savings rate remained unchanged.";
        }
    }

    function getCategoryChanges(currentSummary,previousSummary){
        let categories = [];
        Object.keys(currentSummary.categories).forEach(function(category){
            if(!categories.includes(category)){
                categories.push(category);
            }
        });
        Object.keys(previousSummary.categories).forEach(function(category){
            if(!categories.includes(category)){
                categories.push(category);
            }
        });
        let changes = [];
        categories.forEach(function(category){
            let currentAmount = currentSummary.categories[category] || 0;
            let previousAmount = previousSummary.categories[category] || 0;
            changes.push({
                category:category,
                currentAmount:currentAmount,
                previousAmount:previousAmount,
                difference:currentAmount - previousAmount
            });
        });

        changes.sort(function(a,b){
            return Math.abs(b.difference) - Math.abs(a.difference);
        });
        return changes;
    }

    function displayCategoryChanges(changes){
        if(changes.length === 0){
            categoryList.innerHTML = `
                <div class="analysis-empty-cont">
                    <h3>No expense data found</h3>
                    <p>Add expenses for the selected months to compare categories.</p>
                </div>
            `;

            topChangesList.innerHTML = `
                <div class="analysis-empty-cont">
                    <h3>No changes to show</h3>
                    <p>Category comparisons will appear when expense data is available.</p>
                </div>
            `;
            return;
        }

        categoryList.innerHTML = "";

        changes.forEach(function(item){
            let differenceText = formatCurrency(0);
            if(item.difference > 0){
                differenceText = `+${formatCurrency(item.difference)}`;
            }
            else if(item.difference < 0){
                differenceText = `-${formatCurrency(Math.abs(item.difference))}`;
            }
            let changeClass = "";
            if(item.difference > 0){
                changeClass = "analysis-increase";
            }
            else if(item.difference < 0){
                changeClass = "analysis-decrease";
            }
            categoryList.innerHTML += `
                <div class="analysis-category-item">
                    <div class="analysis-category-info">
                        <h3>${item.category}</h3>
                        <p>${formatCurrency(item.previousAmount)} → ${formatCurrency(item.currentAmount)}</p>
                    </div>
                    <span class="${changeClass}">${differenceText}</span>
                </div>
            `;
        });

        let topChanges = [];
        changes.forEach(function(item){
            if(item.difference !== 0 && topChanges.length < 5){
                topChanges.push(item);
            }
        });

        if(topChanges.length === 0){
            topChangesList.innerHTML = `
                <div class="analysis-empty-cont">
                    <h3>No spending changes</h3>
                    <p>Your category expenses are the same in both months.</p>
                </div>
            `;
            return;
        }

        topChangesList.innerHTML = "";

        topChanges.forEach((item)=>{
            let increased = item.difference > 0;
            let changeClass = increased ? "analysis-increase" : "analysis-decrease";
            let changeSign = increased ? "+" : "-";
            let changeText = increased ? "Spending increased" : "Spending decreased";
            topChangesList.innerHTML += `
                <div class="analysis-top-change-item">
                    <div>
                        <h3>${item.category}</h3>
                        <p>${changeText}</p>
                    </div>
                    <span class="${changeClass}">
                        ${changeSign}${formatCurrency(Math.abs(item.difference))}
                    </span>
                </div>
            `;
        });
    }

    function generateInsights(currentSummary,previousSummary,changes){
        let insights = [];
        let expenseDifference = currentSummary.expenses - previousSummary.expenses;

        if(currentSummary.transactionCount === 0){
            insights.push({
                title:"No transactions recorded",
                description:"There are no transactions in the selected month. Add your transactions for a more meaningful comparison."
            });
        }
        else if(currentSummary.expenseCount === 0){
            insights.push({
                title:"No expenses recorded",
                description:"No expenses were found for this month. Check whether your transactions have been entered correctly."
            });
        }

        if(expenseDifference > 0){
            insights.push({
                title:"Expenses increased",
                description:`You spent ${formatCurrency(expenseDifference)} more than in the previous month.`
            });
        }
        else if(expenseDifference < 0){
            insights.push({
                title:"Expenses decreased",
                description:`You spent ${formatCurrency(Math.abs(expenseDifference))} less than in the previous month.`
            });
        }
        else{
            insights.push({
                title:"Expenses remained stable",
                description:"Your total spending was the same in both selected months."
            });
        }

        if(currentSummary.savingsRate !== null && previousSummary.savingsRate !== null){
            let savingsDifference = currentSummary.savingsRate - previousSummary.savingsRate;

            if(savingsDifference > 0){
                insights.push({
                    title:"Savings rate improved",
                    description:`Your savings rate increased by ${savingsDifference.toFixed(1)} percentage points.`
                });
            }
            else if(savingsDifference < 0){
                insights.push({
                    title:"Savings rate declined",
                    description:`Your savings rate decreased by ${Math.abs(savingsDifference).toFixed(1)} percentage points.`
                });
            }
            else{
                insights.push({
                    title:"Savings rate stayed the same",
                    description:"Your income and expenses resulted in the same savings rate in both months."
                });
            }

            if(currentSummary.savingsRate < 0){
                insights.push({
                    title:"Spending exceeded income",
                    description:"Your recorded expenses were greater than your income for this month."
                });
            }
            else if(currentSummary.savingsRate >= 20){
                insights.push({
                    title:"Healthy savings rate",
                    description:"You retained at least 20% of your recorded income after expenses this month."
                });
            }
        }
        else{
            insights.push({
                title:"Savings rate unavailable",
                description:"Record income in both selected months to compare savings rates."
            });
        }

        let biggestIncrease = null;
        let biggestDecrease = null;

        changes.forEach(function(item){
            if(item.difference > 0 && biggestIncrease === null){
                biggestIncrease = item;
            }

            if(item.difference < 0 && biggestDecrease === null){
                biggestDecrease = item;
            }
        });

        if(biggestIncrease){
            insights.push({
                title:"Largest spending increase",
                description:`${biggestIncrease.category} increased by ${formatCurrency(biggestIncrease.difference)} compared with the previous month.`
            });
        }

        if(biggestDecrease){
            insights.push({
                title:"Largest spending decrease",
                description:`${biggestDecrease.category} decreased by ${formatCurrency(Math.abs(biggestDecrease.difference))} compared with the previous month.`
            });
        }

        return insights.slice(0,5);
    }

    function generateActions(currentSummary,previousSummary,changes){
        let actions = [];

        if(currentSummary.transactionCount === 0){
            actions.push({
                title:"Record your transactions",
                description:"Add this month's income and expenses before making decisions based on the comparison."
            });

            return actions;
        }

        if(currentSummary.expenses > currentSummary.income && currentSummary.income > 0){
            actions.push({
                title:"Review your monthly spending",
                description:"Your expenses exceed your recorded income. Identify non-essential expenses to reduce the shortfall."
            });
        }

        if(currentSummary.savingsRate !== null &&
            currentSummary.savingsRate < 20 &&
            currentSummary.savingsRate >= 0){
            actions.push({
                title:"Set a savings target",
                description:"Your current savings rate is below 20%. Try setting a realistic monthly savings target based on your income."
            });
        }

        if(currentSummary.savingsRate !== null && currentSummary.savingsRate < 0){
            actions.push({
                title:"Reduce the monthly deficit",
                description:"Prioritize essential expenses and review optional spending until your expenses are within your income."
            });
        }

        let biggestIncrease = null;
        let biggestDecrease = null;

        changes.forEach(function(item){
            if(item.difference > 0 && biggestIncrease === null){
                biggestIncrease = item;
            }

            if(item.difference < 0 && biggestDecrease === null){
                biggestDecrease = item;
            }
        });

        if(biggestIncrease){
            actions.push({
                title:`Review ${biggestIncrease.category} spending`,
                description:`Spending increased by ${formatCurrency(biggestIncrease.difference)}. Check the transactions in this category to find possible savings.`
            });
        }

        if(biggestDecrease){
            actions.push({
                title:"Maintain positive changes",
                description:`You reduced ${biggestDecrease.category} spending by ${formatCurrency(Math.abs(biggestDecrease.difference))}. Check whether this reduction is sustainable.`
            });
        }

        if(currentSummary.expenses > previousSummary.expenses &&
            currentSummary.income > 0 &&
            currentSummary.savingsRate !== null &&
            currentSummary.savingsRate >= 20){
            actions.push({
                title:"Keep your spending within your plan",
                description:"Your expenses increased, but your savings rate remains at least 20%. Review the increase to keep your progress on track."
            });
        }

        if(actions.length === 0){
            actions.push({
                title:"Continue tracking your finances",
                description:"Keep recording income and expenses each month so you can spot meaningful changes over time."
            });
        }

        return actions.slice(0,4);
    }

    function displayInsights(insights){
        insightsCont.innerHTML = "";

        insights.forEach(function(item){
            insightsCont.innerHTML += `
                <div class="analysis-insight-item">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
        });
    }

    function displayActions(actions){
        actionsCont.innerHTML = "";
        actions.forEach(function(item,idx){
            actionsCont.innerHTML += `
                <div class="analysis-action-item">
                    <span class="analysis-action-number">${idx+1}</span>
                    <div>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;
        });
    }

    function showEmptyState(){
        expenseChangeValue.textContent = "--";
        expenseChangeText.textContent = "Compare expenses between months.";
        savingsChangeValue.textContent = "--";
        savingsChangeText.textContent = "Compare savings rates between months.";
        categoryList.innerHTML = `
            <div class="analysis-empty-cont">
                <h3>Spending comparisons will appear here</h3>
                <p>Select two months to compare your spending categories.</p>
            </div>
        `;

        topChangesList.innerHTML = `
            <div class="analysis-empty-cont">
                <h3>No comparisons yet</h3>
                <p>Generate an analysis to identify significant changes.</p>
            </div>
        `;

        insightsCont.innerHTML = `
            <div class="analysis-empty-cont">
                <h3>Your insights will appear here</h3>
                <p>Generate an analysis to discover patterns in your financial activity.</p>
            </div>
        `;

        actionsCont.innerHTML = `
            <div class="analysis-empty-cont">
                <h3>Your action plan will appear here</h3>
                <p>Generate an analysis to receive practical suggestions.</p>
            </div>
        `;

        analysisStatusText.textContent =
            "Select a period and generate your financial analysis.";
    }

    function generateAnalysis(){
        let currentMonth = currentMonthSelect.value;
        let previousMonth = previousMonthSelect.value;
        if(!currentMonth || !previousMonth){
            analysisStatusText.textContent = "Please select both months.";
            return;
        }
        if(currentMonth === previousMonth){
            resetAnalysis();
            analysisStatusText.textContent = "Please select two different months.";
            return;
        }
        let transactions = getTransactions();
        let currentTransactions = getMonthTransactions(transactions,currentMonth);
        let previousTransactions = getMonthTransactions(transactions,previousMonth);
        let currentSummary = calculateSummary(currentTransactions);
        let previousSummary = calculateSummary(previousTransactions);
        let changes = getCategoryChanges(currentSummary,previousSummary);
        displayExpenseChange(currentSummary,previousSummary);
        displaySavingsChange(currentSummary,previousSummary);
        displayCategoryChanges(changes);
        let insights = generateInsights(currentSummary,previousSummary,changes);
        let actions = generateActions(currentSummary,previousSummary,changes);
        displayInsights(insights);
        displayActions(actions);
        analysisStatusText.textContent =`Compared ${formatMonth(currentMonth)} with ${formatMonth(previousMonth)}.`;
    }

    function resetAnalysis(){
        showEmptyState();
    }

    loadMonthOptions();
    showEmptyState();
    generateAnalysisBtn.addEventListener("click",generateAnalysis);
    if(resetAnalysisBtn){
        resetAnalysisBtn.addEventListener("click",resetAnalysis);
    }
    currentMonthSelect.addEventListener("change",function(){
        analysisStatusText.textContent ="Month changed. Generate the analysis again.";
    });

    previousMonthSelect.addEventListener("change",function(){
        analysisStatusText.textContent ="Month changed. Generate the analysis again.";
    });
}
