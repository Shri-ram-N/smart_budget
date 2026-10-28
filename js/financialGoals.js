import { formatCurrency } from "./utils.js";
import { getCurrentUser } from "./auth.js";

export function initFinancialGoals() {
    let currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }

    let storageKey = `financialGoals_${currentUser.id}`;
    let goals = JSON.parse(localStorage.getItem(storageKey)) || [];
    let selectedGoalId = "";
    let goalsList = document.querySelector("#goals-page-list");
    let goalsEmpty = document.querySelector("#goals-page-empty");
    let totalGoals = document.querySelector("#total-financial-goals");
    let completedGoals = document.querySelector("#completed-financial-goals");
    let activeGoals = document.querySelector("#active-financial-goals");
    let delayedGoals = document.querySelector("#delayed-financial-goals");
    let sortSelect = document.querySelector("#financial-goal-sort");
    let addGoalBtn = document.querySelector("#add-financial-goal-btn");
    let createFirstGoalBtn = document.querySelector("#create-first-financial-goal-btn");
    let goalModal = document.querySelector("#financial-goal-modal-overlay");
    let goalModalTitle = document.querySelector("#financial-goal-modal-title");
    let closeGoalBtn = document.querySelector("#close-financial-goal-modal");
    let cancelGoalBtn = document.querySelector("#cancel-financial-goal-btn");
    let goalForm = document.querySelector("#financial-goal-form");
    let goalName = document.querySelector("#financial-goal-name");
    let goalDescription = document.querySelector("#financial-goal-description");
    let targetAmount = document.querySelector("#financial-goal-target-amount");
    let savedAmount = document.querySelector("#financial-goal-saved-amount");
    let targetDate = document.querySelector("#financial-goal-target-date");
    let goalIcon = document.querySelector("#financial-goal-icon");
    let customGoalField = document.querySelector("#custom-financial-goal-field");
    let customGoalName = document.querySelector("#custom-financial-goal-name");
    let deleteModal = document.querySelector("#financial-goal-delete-overlay");
    let cancelDeleteBtn = document.querySelector("#cancel-delete-financial-goal-btn");
    let confirmDeleteBtn = document.querySelector("#confirm-delete-financial-goal-btn");

    function saveGoals(){
        localStorage.setItem(storageKey, JSON.stringify(goals));
    }

    function getStatus(goal){
        if (goal.savedAmount >= goal.targetAmount) {
            return "completed";
        }
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let date = new Date(goal.targetDate + "T00:00:00");
        if (date < today) {
            return "delayed";
        }
        return "active";
    }

    function updateSummary(){
        let completed = 0;
        let active = 0;
        let delayed = 0;
        goals.forEach(function (goal){
            let status = getStatus(goal);
            if (status === "completed"){
                completed++;
            } 
            else if (status === "delayed"){
                delayed++;
            } 
            else {
                active++;
            }
        });
        totalGoals.textContent = goals.length;
        completedGoals.textContent = completed;
        activeGoals.textContent = active;
        delayedGoals.textContent = delayed;
    }

    function sortGoals(){
        if (sortSelect.value === "name"){
            goals.sort(function (a,b){
                return a.name.localeCompare(b.name);
            });
        } 
        else if (sortSelect.value === "progress"){
            goals.sort(function (a,b){
                return getProgress(b) - getProgress(a);
            });
        } 
        else if (sortSelect.value === "amount"){
            goals.sort(function (a,b){
                return b.targetAmount - a.targetAmount;
            });
        } 
        else{
            goals.sort(function (a,b){
                return a.targetDate.localeCompare(b.targetDate);
            });
        }
    }

    function getProgress(goal){
        return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
    }

    function createGoals(){
        sortGoals();
        updateSummary();
        if (goals.length === 0) {
            goalsList.innerHTML = "";
            goalsList.style.display = "none";
            goalsEmpty.style.display = "flex";
            return;
        }
        goalsList.style.display = "grid";
        goalsEmpty.style.display = "none";
        goalsList.innerHTML = "";
        goals.forEach(function (goal){
            let progress = getProgress(goal);
            let status = getStatus(goal);
            let barColor = progress != 100? "var(--warning-color)": "var(--primary-color)";
            // let remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
            let date = new Date(goal.targetDate + "T00:00:00");
            let formattedDate = date.toLocaleDateString("en-IN",{
                day: "numeric",
                month: "short",
                year: "numeric"
            });
            let statusText = "In Progress";
            if (status === "completed") {
                statusText = "Completed";
            } 
            else if (status === "delayed") {
                statusText = "Behind Schedule";
            }
            let card = document.createElement("div");
            card.className = "goals-page-card";
            card.dataset.goalId = goal.id;

            card.innerHTML = `
                <div class="financial-goal-card-header">
                    <div class="goals-page-icon">
                        <i class="fa-solid ${goal.icon}"></i>
                    </div>

                    <div class="financial-goal-card-title">
                        <h3></h3>
                        <p></p>
                    </div>

                    <div class="financial-goal-card-actions">
                        <button type="button" class="financial-goal-edit-btn" data-action="edit" data-id="${goal.id}" aria-label="Edit goal">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button type="button" class="financial-goal-delete-btn" data-action="delete" data-id="${goal.id}" aria-label="Delete goal">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <div class="financial-goal-card-amounts">
                    <div>
                        <span>Saved so far</span>
                        <h3>${formatCurrency(goal.savedAmount)}</h3>
                    </div>

                    <div>
                        <span>Target amount</span>
                        <h3>${formatCurrency(goal.targetAmount)}</h3>
                    </div>
                </div>

                <div class="goals-page-progress">
                    <div class="financial-goal-progress-header">
                        <span>Progress</span>
                        <span>${progress}%</span>
                    </div>

                    <div class="goals-page-track">
                        <div class="goals-page-fill" style="width: ${Math.min(progress,100)}%; background: ${barColor};"></div>
                    </div>
                </div>

                <div class="financial-goal-card-footer">
                    <div class="financial-goal-target-date">
                        <i class="fa-regular fa-calendar"></i>
                        <span>Target: ${formattedDate}</span>
                    </div>

                    <span class="financial-goal-status ${status}">${statusText}</span>
                </div>

                <div class="financial-goal-update-amount">
                    <button type="button" class="financial-goal-update-btn" data-action="toggle-amount">
                        <i class="fa-solid fa-plus"></i>
                        Update Saved Amount
                    </button>

                    <form class="financial-goal-amount-form" data-goal-id="${goal.id}" hidden>
                        <label>New total saved amount (₹)</label>
                        <input type="number" name="savedAmount" min="0" max="100000000"" value="${goal.savedAmount}" required>

                        <div class="financial-goal-amount-actions">
                            <button type="button" class="financial-goal-cancel-amount-btn" data-action="cancel-amount">Cancel</button>

                            <button type="submit" class="financial-goal-save-amount-btn">Save Amount</button>
                        </div>
                    </form>
                </div>
            `;

            card.querySelector(".financial-goal-card-title h3").textContent = goal.name;
            card.querySelector(".financial-goal-card-title p").textContent = goal.description || "No description added";
            goalsList.appendChild(card);
        });
    }

    function toggleCustomGoalField(){
        let isOther = goalIcon.value === "fa-ellipsis";
        customGoalField.hidden = !isOther;
        customGoalName.required = isOther;
        goalName.required = !isOther;
        if (isOther) {
            customGoalName.focus();
        } else {
            customGoalName.value = "";
        }
    }

    function openGoalModal(goalId = ""){
        selectedGoalId = goalId;
        goalForm.reset();
        goalName.required = true;
        customGoalName.required = false;
        customGoalField.hidden = true;
        savedAmount.value = 0;
        if (goalId){
            let goal = goals.find(function (item) {
                return item.id === goalId;
            });
            if (!goal) {
                return;
            }
            goalModalTitle.textContent = "Edit Financial Goal";
            goalName.value = goal.name;
            goalDescription.value = goal.description || "";
            targetAmount.value = goal.targetAmount;
            savedAmount.value = goal.savedAmount;
            targetDate.value = goal.targetDate;
            goalIcon.value = goal.icon;
            if (goal.icon === "fa-ellipsis") {
                customGoalField.hidden = false;
                customGoalName.required = true;
                goalName.required = false;
                customGoalName.value = goal.name;
            }
        } 
        else {
            goalModalTitle.textContent = "Create Financial Goal";
        }
        toggleCustomGoalField();
        goalModal.classList.add("show");
    }
    function closeGoalModal(){
        goalModal.classList.remove("show");
        goalForm.reset();
        selectedGoalId = "";
        customGoalField.hidden = true;
        customGoalName.required = false;
        goalName.required = true;
    }

    function closeDeleteModal(){
        deleteModal.classList.remove("show");
        selectedGoalId = "";
    }

    let goalDeadline = document.querySelector("#financial-goal-target-date");
    function pastDatePrevent(){
        let today = new Date();
        let localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
        goalDeadline.min = localDate;
    }
    pastDatePrevent();

    addGoalBtn.addEventListener("click", function () {
        openGoalModal();
    });

    createFirstGoalBtn.addEventListener("click", function () {
        openGoalModal();
    });

    closeGoalBtn.addEventListener("click",closeGoalModal);
    cancelGoalBtn.addEventListener("click",closeGoalModal);

    goalModal.addEventListener("click", function (event) {
        if (event.target === goalModal){
            closeGoalModal();
        }
    });

    goalIcon.addEventListener("change", toggleCustomGoalField);

    goalForm.addEventListener("submit", function (event){
        event.preventDefault();
        let isOther = goalIcon.value === "fa-ellipsis";
        let name = isOther ? customGoalName.value.trim() : goalName.value.trim();
        let target = Number(targetAmount.value);
        let saved = Number(savedAmount.value);

        if (!name || target <= 0 || saved < 0) {
            return;
        }
        let goalData ={
            name: name,
            description: goalDescription.value.trim(),
            targetAmount: target,
            savedAmount: saved,
            targetDate: targetDate.value,
            icon: goalIcon.value
        };

        if (selectedGoalId){
            goals = goals.map(function(goal) {
                if (goal.id === selectedGoalId) {
                    goal.name = goalData.name;
                    goal.description = goalData.description;
                    goal.targetAmount = goalData.targetAmount;
                    goal.savedAmount = goalData.savedAmount;
                    goal.targetDate = goalData.targetDate;
                    goal.icon = goalData.icon;
                }
                return goal;
            });
        } 
        else {
            goalData.id = Date.now().toString();
            goals.push(goalData);
        }
        saveGoals();
        window.dispatchEvent(new Event("financial-goals-updated"));
        createGoals();
        closeGoalModal();
    });

    goalsList.addEventListener("click", function(event){
        let button = event.target.closest("[data-action]");
        if (!button){
            return;
        }
        let action = button.dataset.action;
        let goalCard = button.closest(".goals-page-card");
        let goalId = button.dataset.id || (goalCard ? goalCard.dataset.goalId : "");
        if (action === "edit"){
            openGoalModal(goalId);
        } 
        else if (action === "delete"){
            selectedGoalId = goalId;
            deleteModal.classList.add("show");
        } 
        else if (action === "toggle-amount"){
            let form = goalCard.querySelector(".financial-goal-amount-form");
            form.hidden = !form.hidden;
        } 
        else if (action === "cancel-amount"){
            let form = button.closest(".financial-goal-amount-form");
            let goal = goals.find(function (item){
                return item.id === form.dataset.goalId;
            });

            if (goal){
                form.querySelector('input[name="savedAmount"]').value = goal.savedAmount;
            }
            form.hidden = true;
        }
    });

    goalsList.addEventListener("submit", function (event){
        if (!event.target.matches(".financial-goal-amount-form")) {
            return;
        }

        event.preventDefault();
        let form = event.target;
        let goalId = form.dataset.goalId;
        let newAmount = Number(form.querySelector('input[name="savedAmount"]').value);

        if (newAmount < 0) {
            return;
        }
        goals = goals.map(function (goal){
            if (goal.id === goalId) {
                goal.savedAmount = newAmount;
            }
            return goal;
        });

        saveGoals();
        window.dispatchEvent(new Event("financial-goals-updated"));
        createGoals();
    });

    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

    deleteModal.addEventListener("click", function (event){
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    confirmDeleteBtn.addEventListener("click", function(){
        if (!selectedGoalId) {
            return;
        }

        goals = goals.filter(function (goal){
            return goal.id !== selectedGoalId;
        });

        saveGoals();
        window.dispatchEvent(new Event("financial-goals-updated"));
        createGoals();
        closeDeleteModal();
    });

    sortSelect.addEventListener("change",createGoals);
    createGoals();
}