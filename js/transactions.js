import {getCategory} from "./categoryConfig.js";
import * as auth from "./auth.js";
import {formatCurrency} from "./utils.js";

let currentUser = auth.getCurrentUser();
if (!currentUser){
    window.location.href = "auth.html";
    throw new Error("User is not logged in.");
}
let currentUserId = currentUser.id;
let transactionUserKey = `transactions_${currentUserId}`;

let transactions = [];
try{
    transactions = JSON.parse(localStorage.getItem(transactionUserKey));
    if (!Array.isArray(transactions)){
        transactions = [];
    }
}
catch(e){
    console.error(e);
    transactions = [];
}

function formatDateForDisplay(date){
    let [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
}

let tableBody = document.querySelector("#transactions-table-body");
let transactionRecCount = document.querySelector("#transaction-record-count");
let mobileFilter = document.querySelector("#mobile-filter-btn");
let transactionFilterRow = document.querySelector(".transaction-filter-panel");
let transactionFilterOverlay = document.querySelector("#transaction-filter-overlay");
let transactionsForm = document.querySelector("#transaction-form");
let transactionOverlay = document.querySelector("#transaction-modal-overlay");
let transactionDltOverlay = document.querySelector("#transaction-delete-overlay");
let addNewBtn = document.querySelector("#add-transaction-btn");
let closeForm = document.querySelector("#close-transaction-modal");
let cancelForm = document.querySelector("#cancel-transaction-btn");
let transactionToDelete = null;
let cancelDeleteBtn = document.querySelector("#cancel-delete-transaction-btn");
let confirmDeleteBtn = document.querySelector("#confirm-delete-transaction-btn");
let transactionToSearch = document.querySelector("#transaction-search");
let typeFilter = document.querySelector("#transaction-type-filter");
let categoryFilter = document.querySelector("#transaction-category-filter");
let transactionStartDate = document.querySelector("#transaction-start-date");
let transactionEndDate = document.querySelector("#transaction-end-date");
let transactionSort = document.querySelector("#transaction-sort");
let clearFilters = document.querySelector("#clear-transaction-filters");
let transactionModalTitle = document.querySelector("#transaction-modal-title");
let transactionCategory = document.querySelector("#transaction-category");
let customCategoryField = document.querySelector("#custom-category-field");
let transactionDate = document.querySelector("#transaction-date");
let customCategoryName = document.querySelector("#custom-category-name");
let transactionType = document.querySelector("#transaction-type");
let transactionTotalIncome = document.querySelector("#transaction-total-income");
let transactionTotalExpenses = document.querySelector("#transaction-total-expenses");
let transactionTotalSavings = document.querySelector("#transaction-total-savings");

export function createTransactions(transactionsToCreate){
    tableBody.innerHTML = "";
    if (transactions.length === 0){
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="transaction-empty-message">
                    <i class="fa-solid fa-receipt"></i>
                    <p>No transactions yet</p>
                    <span>Add your first transaction to see it here.</span>
                </td>
            </tr>
        `;
        return;
    }
    else if (transactionsToCreate.length === 0){
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="transaction-empty-message">
                    <p>No matching transactions found</p>
                    <span>Try adjusting your search or filters.</span>
                </td>
            </tr>
        `;
        return;
    }

    transactionsToCreate.forEach((transaction,idx)=>{
        let row = document.createElement("tr");
        let categoryStyle = getCategory(transaction.category);
        let displayCategory = transaction.customCategory ? transaction.customCategory.replace(/\b\w/g, char => char.toUpperCase()) : transaction.category || "Others";
        row.innerHTML = `
            <td class="transaction-row-number">
                ${idx+1}
            </td>

            <td>
                <div class="transaction-title-cell">
                    <span class="transaction-icon"
                        style="background-color: ${categoryStyle.background}; color: ${categoryStyle.color};">
                        <i class="${categoryStyle.icon}"></i>
                    </span>

                    <div class="transaction-details">
                        <p class="transaction-title">${transaction.title}</p>
                        <p class="transaction-meta">${transaction.notes || transaction.category}</p>
                    </div>
                </div>
            </td>

            <td>
                <span class="transaction-category-badge"
                    style="color: ${categoryStyle.color}; background-color: ${categoryStyle.background};">
                    ${displayCategory}
                </span>
            </td>

            <td>${formatDateForDisplay(transaction.date)}</td>

            <td>
                <span class="transaction-type-badge ${transaction.type === "income" ? "transaction-type-income" :
                    transaction.type === "savings" ? "transaction-type-savings" : "transaction-type-expense"}">
                    ${transaction.type === "income" ? "Income" : transaction.type === "savings" ? "Savings" : "Expense"}
                </span>
            </td>

            <td class="${transaction.type === "income" ? "transaction-income" :transaction.type === "savings" ? "transaction-savings" :"transaction-expense"}">
                ${transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}${formatCurrency(transaction.amount)}
            </td>

            <td class="transaction-action-buttons">
                <button type="button" class="transaction-edit-btn" ${editBtnDisable(transaction.date) ? "" : "disabled"} title="${editBtnDisable(transaction.date) ? "Edit transaction" : "Transactions older than one month cannot be edited"}" data-id="${transaction.id}">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button type="button" class="transaction-delete-btn" data-id="${transaction.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

applyTransactionFilters();

mobileFilter.addEventListener("click",()=>{
        transactionFilterRow.classList.toggle("filters-open")
})

transactionFilterOverlay.addEventListener("click",()=>{
    transactionFilterRow.classList.remove("filters-open");
});

addNewBtn.addEventListener("click",()=>{
    resetTransactionForm();
    transactionModalTitle.textContent = "Add Transaction";
    setSubmitHandler(handleAddSubmit,handleEditSubmit);
    transactionOverlay.classList.add("show");
});

closeForm.addEventListener("click",()=>{
    resetTransactionForm();
    transactionOverlay.classList.remove("show");
})

cancelForm.addEventListener("click",()=>{
    resetTransactionForm();
    transactionOverlay.classList.remove("show");
})

transactionOverlay.addEventListener("click",(event)=>{
    if (event.target === transactionOverlay){
        resetTransactionForm();
        transactionOverlay.classList.remove("show");
    }
});

function generateTransactionId(){
    return transactions.length === 0 ? 1: Math.max(...transactions.map(transaction => transaction.id)) + 1;
}

function resetTransactionForm(){
    transactionsForm.reset();
    customCategoryField.hidden = true;
    customCategoryName.required = false;
    customCategoryName.value = "";
}

function isDuplicateTransaction(newTransaction, ignoreId = null) {
    return transactions.some(transaction => {
        return transaction.id !== ignoreId && transaction.title.trim().toLowerCase() === newTransaction.title.trim().toLowerCase() &&
            Number(transaction.amount) === Number(newTransaction.amount) && transaction.type === newTransaction.type &&
            transaction.category === newTransaction.category &&
            (transaction.customCategory || "").trim().toLowerCase() === (newTransaction.customCategory || "").trim().toLowerCase() &&
            transaction.date === newTransaction.date;
    });
}

function addTransaction(){
    let transactionId = generateTransactionId();
    let transactionTitle = document.querySelector("#transaction-title").value;
    let transactionAmt = +document.querySelector("#transaction-amount").value;
    let transactionType = document.querySelector("#transaction-type").value;
    let transactionCategory = document.querySelector("#transaction-category").value;
    let customCategory = transactionCategory === "Others"? customCategoryName.value.trim() : "";
    let transactionDate = document.querySelector("#transaction-date").value;
    let transactionNotes = document.querySelector("#transaction-notes").value;
    let newTransaction = {
        id: transactionId,
        title: transactionTitle,
        amount: transactionAmt,
        type: transactionType,
        category: transactionCategory,
        customCategory: customCategory,
        date: transactionDate,
        notes: transactionNotes
    };
    transactions.push(newTransaction);
    localStorage.setItem(transactionUserKey,JSON.stringify(transactions));
    window.dispatchEvent(new Event("transactions-updated"));
    window.dispatchEvent(new Event("budgets-updated"));
}

function editBtnDisable(date){
    let oneMonAgo = new Date();
    oneMonAgo.setHours(0,0,0,0);
    oneMonAgo.setMonth(oneMonAgo.getMonth()-1);
    return new Date(date + "T00:00:00") >= oneMonAgo;
}

function setTransactionDateLimit(){
    let today = new Date();
    let localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    transactionDate.max = localDate;
}
setTransactionDateLimit();

function handleAddSubmit(event){
    event.preventDefault();
    let newTransaction = {
        title: document.querySelector("#transaction-title").value.trim(),
        amount: Number(document.querySelector("#transaction-amount").value),
        type: transactionType.value,
        category: transactionCategory.value,
        customCategory: transactionCategory.value === "Others"? customCategoryName.value.trim(): "",
        date: transactionDate.value
    };

    if (isDuplicateTransaction(newTransaction)) {
        let confirmDuplicate = window.confirm("A similar transaction already exists. Do you still want to add it?");
        if (!confirmDuplicate) {
            return;
        }
    }
    addTransaction();
    applyTransactionFilters();
    transactionsForm.reset();
    transactionType.dispatchEvent(new Event("change"));
    transactionOverlay.classList.remove("show");
}

transactionType.addEventListener("change",()=>{
    transactionCategory.innerHTML = '<option value="">Select Category</option>';
    if (transactionType.value === "income"){
        transactionCategory.innerHTML += `
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment">Investment</option>
            <option value="Rental">Rental</option>
            <option value="Passive">Passive</option>
        `;
    }
    else if (transactionType.value === "expense"){
        transactionCategory.innerHTML += `
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Utilities">Utilities</option>
            <option value="Others">Others</option>
        `;
    }
    else if (transactionType.value === "savings"){
        transactionCategory.innerHTML += `
            <option value="Savings">Savings</option>
            <option value="Investment">Investment</option>
        `;
    }
});

function updateTransaction(){
    let editingId = document.querySelector("#transaction-id").value;
    let editingTransaction = transactions.find((transaction) => {
        return transaction.id == editingId;
    });

    if (!editingTransaction) {
        console.error("Transaction not found:", editingId);
        return;
    }
    editingTransaction.title = document.querySelector("#transaction-title").value;
    editingTransaction.amount = +document.querySelector("#transaction-amount").value;
    editingTransaction.type = document.querySelector("#transaction-type").value;
    editingTransaction.category = transactionCategory.value;
    editingTransaction.customCategory = transactionCategory.value === "Others" ? customCategoryName.value.trim() : "";
    editingTransaction.date = document.querySelector("#transaction-date").value;
    editingTransaction.notes = document.querySelector("#transaction-notes").value;
    localStorage.setItem(transactionUserKey, JSON.stringify(transactions));
    window.dispatchEvent(new Event("transactions-updated"));
    window.dispatchEvent(new Event("budgets-updated"));
}

function handleEditSubmit(event){
    event.preventDefault();
    updateTransaction();
    applyTransactionFilters();
    transactionsForm.reset();
    transactionOverlay.classList.remove("show");
}

tableBody.addEventListener("click",(event)=>{
    let editBtn = event.target.closest(".transaction-edit-btn");
    let dltBtn = event.target.closest(".transaction-delete-btn");
    if (editBtn){
        let transactionId = editBtn.dataset.id;
        let selectedTransaction = transactions.find((transaction)=>{
           return transaction.id == transactionId
        })
        document.querySelector("#transaction-id").value = selectedTransaction.id;
        document.querySelector("#transaction-title").value = selectedTransaction.title;
        document.querySelector("#transaction-amount").value = selectedTransaction.amount;
        transactionType.value = selectedTransaction.type;
        transactionType.dispatchEvent(new Event("change"));
        transactionCategory.value = selectedTransaction.category;
        customCategoryName.value = selectedTransaction.customCategory || "";
        toggleCustomCategoryField();
        document.querySelector("#transaction-date").value = selectedTransaction.date;
        document.querySelector("#transaction-notes").value = selectedTransaction.notes;
        transactionModalTitle.textContent = "Edit Transaction";
        setSubmitHandler(handleEditSubmit,handleAddSubmit);
        transactionOverlay.classList.add("show");
    }
    if (dltBtn){
        let transactionDltId = dltBtn.dataset.id;
        transactionToDelete = Number(transactionDltId);
        transactionDltOverlay.classList.add("show");
    }
});

cancelDeleteBtn.addEventListener("click",()=>{
    transactionDltOverlay.classList.remove("show");
    transactionToDelete = null;
})

confirmDeleteBtn.addEventListener("click",()=>{
    if (transactionToDelete == null){
        return;
    }
    transactions = transactions.filter((transaction)=>{
        return transaction.id != transactionToDelete
    });
    localStorage.setItem(transactionUserKey, JSON.stringify(transactions));
    window.dispatchEvent(new Event("transactions-updated"));
    window.dispatchEvent(new Event("budgets-updated"));
    applyTransactionFilters();
    transactionDltOverlay.classList.remove("show");
    transactionToDelete = null;
})

function setSubmitHandler(handlerToUse,handlerToremove){
    transactionsForm.removeEventListener("submit",handlerToremove);
    transactionsForm.addEventListener("submit",handlerToUse);
}

clearFilters.addEventListener("click", () => {
    transactionToSearch.value = "";
    typeFilter.value = "all";
    categoryFilter.value = "all";
    transactionStartDate.value = "";
    transactionEndDate.value = "";
    transactionSort.value = "newest";
    applyTransactionFilters();
});

function toggleCustomCategoryField(){
    let isOthers = transactionCategory.value === "Others";
    customCategoryField.hidden = !isOthers;
    customCategoryName.required = isOthers;
    if (!isOthers){
        customCategoryName.value = "";
    }
}

transactionCategory.addEventListener("change", toggleCustomCategoryField);
toggleCustomCategoryField();

function updateTransactionTotals(filteredTransactions) {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;

    filteredTransactions.forEach(transaction => {
        let amount = Number(transaction.amount);

        if (transaction.type === "income") {
            totalIncome += amount;
        } else if (transaction.type === "expense") {
            totalExpenses += amount;
        } else if (transaction.type === "savings") {
            totalSavings += amount;
        }
    });

    transactionTotalIncome.textContent = formatCurrency(totalIncome);
    transactionTotalExpenses.textContent = formatCurrency(totalExpenses);
    transactionTotalSavings.textContent = formatCurrency(totalSavings);

    document.querySelector("#transaction-income-total-card").hidden = typeFilter.value === "expense" || typeFilter.value === "savings";

    document.querySelector("#transaction-expense-total-card").hidden =typeFilter.value === "income" || typeFilter.value === "savings";

    document.querySelector("#transaction-savings-total-card").hidden =typeFilter.value === "income" || typeFilter.value === "expense";
}

function applyTransactionFilters(){
    let searchName = transactionToSearch.value.toLowerCase();
    let selectedType = typeFilter.value;
    let selectedCategory = categoryFilter.value;
    let startDate = transactionStartDate.value;
    let endDate = transactionEndDate.value;
    let sortOption = transactionSort.value;
    let filteredTransactions = [...transactions];
    filteredTransactions = filteredTransactions.filter((transaction)=>{
        return transaction.title.toLowerCase().includes(searchName);
    });
    if (selectedType !== "all"){
        filteredTransactions = filteredTransactions.filter((transaction)=>{
            return transaction.type === selectedType;
        });
    }
    if (selectedCategory !== "all"){
        filteredTransactions = filteredTransactions.filter((transaction)=>{
            return transaction.category === selectedCategory;
        });
    }
    if (startDate){
        filteredTransactions = filteredTransactions.filter((transaction)=>{
            return transaction.date >= startDate;
        });
    }
    if (endDate){
        filteredTransactions = filteredTransactions.filter((transaction)=>{
            return transaction.date <= endDate;
        });
    }
    if (sortOption === "newest") {
        filteredTransactions.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortOption === "oldest") {
        filteredTransactions.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortOption === "amount-high") {
        filteredTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortOption === "amount-low") {
        filteredTransactions.sort((a, b) => a.amount - b.amount);
    }
    transactionRecCount.textContent = `Showing ${filteredTransactions.length} transactions`;
    updateTransactionTotals(filteredTransactions);
    createTransactions(filteredTransactions);
}

function closeMobileFilter(){
    if (window.innerWidth <= 768){
        transactionFilterRow.classList.remove("filters-open");
    }
}

transactionToSearch.addEventListener("input", applyTransactionFilters);

[typeFilter,categoryFilter,transactionStartDate,transactionEndDate,transactionSort].forEach((filter)=>{
    filter.addEventListener("change",()=>{
        applyTransactionFilters();
        closeMobileFilter();
    });
});

clearFilters.addEventListener("click",()=>{
    transactionToSearch.value = "";
    typeFilter.value = "all";
    categoryFilter.value = "all";
    transactionStartDate.value = "";
    transactionEndDate.value = "";
    transactionSort.value = "newest";
    applyTransactionFilters();
    closeMobileFilter();
});