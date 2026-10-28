import {getCategory} from "./categoryConfig.js";
let spendingChart = undefined;
let monthlySummaryChart = undefined;

export function initCharts(){
    let chartContainer = document.querySelector("#spending-pie-chart");
    if (chartContainer){
        let labelData = ["Food","Transport","Shopping"];
        spendingChart = new Chart(chartContainer,{
            type: "doughnut",
            data: {
                labels:labelData,
                datasets:[
                    {
                        label:"Spending",
                        data:[500,200,300],
                        backgroundColor:labelData.map(label=> getCategory(label).color),
                    }
                ]
            },
            options:{
                responsive: true,
                cutout:"65%",
                plugins:{
                    legend:{
                        display:false
                    }
                }
            }
        });
    }
    let monthlyCanvas = document.querySelector("#monthly-summary-canvas");
    if (monthlyCanvas){
        monthlySummaryChart = new Chart(monthlyCanvas,{
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug","Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    {
                        label: "Income",
                        data: Array(12).fill(0),
                        backgroundColor: "#168653"
                    },
                    {
                        label: "Expenses",
                        data: Array(12).fill(0),
                        backgroundColor: "#3978C5"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

export function updateSpendingChart(categoryTotals){
    if (spendingChart){
        let labels = Object.keys(categoryTotals);
        let amounts = Object.values(categoryTotals);
        let colors = labels.map(label=> getCategory(label).color);
        spendingChart.data.labels = labels;
        spendingChart.data.datasets[0].data = amounts;
        spendingChart.data.datasets[0].backgroundColor = colors;
        spendingChart.update();
    }
}

export function updateMonthlySummary(transactions, selectedYear){
    if (monthlySummaryChart){
        let monthlyIncome = Array(12).fill(0);
        let monthlyExpenses = Array(12).fill(0);
        transactions.forEach(transaction => {
            let [year, month] = transaction.date.split("-").map(Number);
            if (year === Number(selectedYear)){
                let monthIndex = month - 1;
                let amount = Number(transaction.amount);
                if (transaction.type === "income"){
                    monthlyIncome[monthIndex] += amount;
                }
                else if (transaction.type === "expense"){
                    monthlyExpenses[monthIndex] += amount;
                }
            }
        });
        monthlySummaryChart.data.datasets[0].data = monthlyIncome;
        monthlySummaryChart.data.datasets[1].data = monthlyExpenses;
        monthlySummaryChart.update();
    }
}