# Smart Budget 💰

**Smart Budget** is a personal finance management web application designed to help users track income, manage expenses, plan budgets, and monitor their financial goals in one place.

## ✨ Features

- **Dashboard** — View total income, expenses, savings, available balance, and recent transactions.
- **Transaction Management** — Add, edit, delete, search, filter, and sort financial transactions.
- **Budget Planner** — Set monthly budgets by category and track spending against budget limits.
- **Spending Overview** — Visualize spending patterns and category-wise expenses using charts.
- **Financial Analysis** — Compare financial performance across different months.
- **Financial Goals** — Create financial goals and track savings progress.
- **Smart Tips** — Get helpful insights to improve spending and saving habits.
- **Dark Mode** — Switch between light and dark themes.
- **User Authentication** — Register and log in to access your personal finance dashboard.
- **Data Export** — Export transaction data in JSON or CSV format.

## 🛠️ Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Chart.js
- Browser LocalStorage

## 📁 Project Structure

```text
smart_budget/
├── auth.html
├── index.html
├── style.css
├── css/
│   ├── auth.css
│   ├── basic.css
│   ├── budget_planner.css
│   ├── dashboard.css
│   ├── financial_analysis.css
│   ├── goals_section.css
│   ├── mobile_responsive.css
│   ├── sidebar.css
│   └── transactions.css
├── images/
├── js/
│   ├── auth.js
│   ├── authPage.js
│   ├── budgetPlanner.js
│   ├── categoryConfig.js
│   ├── charts.js
│   ├── dashboard.js
│   ├── financialAnalysis.js
│   ├── financialGoals.js
│   ├── main.js
│   ├── sidebar.js
│   ├── theme.js
│   ├── transactions.js
│   └── utils.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A local development server, such as the VS Code Live Server extension

### Run Locally

1. Clone the repository:

   ```bash
   git clone git@github.com:Shri-ram-N/smart_budget.git
   ```

2. Open the project folder:

   ```bash
   cd smart_budget
   ```

3. Start the project using VS Code Live Server or another local HTTP server.

4. Open the served page in your browser and start exploring Smart Budget.

## 💾 Data Storage

Smart Budget uses browser LocalStorage to store user-related information and transaction data locally in the browser.

Data stored in LocalStorage is browser-specific and is not automatically synchronized across devices.

## 🔒 Security Note

This project is intended for learning and personal finance management. Browser-based authentication and LocalStorage are not a substitute for secure server-side authentication and database storage.

Avoid storing real passwords, sensitive financial information, or other confidential data in an insecure environment.

## 📌 Future Improvements

- Backend integration and database storage
- Secure server-side authentication
- Financial reports and advanced analytics
- Improved data synchronization and backup

## 👨‍💻 Author

**Shri-ram-N**

---

*Plan better. Track smarter. Grow financially.*
