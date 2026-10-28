# Smart Budget 💰

A personal finance management web application built to help users track income, manage expenses, plan monthly budgets, analyze financial habits, and monitor savings goals.

## 🌐 Live Demo

**Try Smart Budget here:** [https://shri-ram-n.github.io/smart_budget/](https://shri-ram-n.github.io/smart_budget/)

## ✨ Features

- **Dashboard** — View total income, expenses, savings, available balance, and recent transactions.
- **Transaction Management** — Add, edit, delete, search, filter, and sort transactions.
- **Budget Planner** — Create monthly budgets by category and monitor spending limits.
- **Spending Overview** — Visualize category-wise expenses with charts.
- **Financial Analysis** — Compare financial activity across different months.
- **Financial Goals** — Set savings goals and monitor progress.
- **Smart Tips** — Display helpful insights for better spending and saving habits.
- **Dark Mode** — Switch between light and dark themes.
- **User Authentication** — Register and log in to access the application.
- **Data Export** — Export transaction data in JSON or CSV format.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS and ES Modules)
- Chart.js
- Browser LocalStorage

## 📁 Project Structure

```text
smart_budget/
├── auth.html
├── index.html
├── style.css
├── README.md
├── .gitignore
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
│   ├── dark-logo-img.png
│   ├── favicon.png
│   ├── logo-img.png
│   ├── sidebar-tip-logo.png
│   └── smart-tip-plant.png
└── js/
    ├── auth.js
    ├── authPage.js
    ├── budgetPlanner.js
    ├── categoryConfig.js
    ├── charts.js
    ├── dashboard.js
    ├── financialAnalysis.js
    ├── financialGoals.js
    ├── main.js
    ├── sidebar.js
    ├── theme.js
    ├── transactions.js
    └── utils.js
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Visual Studio Code or another code editor
- A local development server, such as the VS Code Live Server extension

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:Shri-ram-N/smart_budget.git
   ```

2. Navigate to the project directory:

   ```bash
   cd smart_budget
   ```

3. Open the project folder in your code editor.

4. Start a local development server using Live Server or another static HTTP server.

5. Open the locally served website in your browser.

## 💾 Data Storage

Smart Budget uses browser LocalStorage to store user-related information and financial transaction data.

Since the application uses browser-based storage, data is specific to the browser and device. It is not automatically synchronized across devices, and clearing browser storage may result in data loss.

## 🔐 Security and Learning Purpose

This project was developed for **educational purposes** to explore frontend development, browser-based data storage, user authentication concepts, and basic cryptographic techniques.

SHA-256 was explored as part of the learning process to understand cryptographic hashing.

**Important security distinction:** SHA-256 is a one-way cryptographic hash function, not encryption. It does not provide a way to decrypt the original input. Plain SHA-256 alone is not suitable for securely storing passwords in a production application. Production systems should use a password-hashing algorithm designed for password storage, such as Argon2id, scrypt, or appropriately configured bcrypt, with salts and other recommended protections.

This application is a learning project and should not be used to store sensitive financial information or real passwords without appropriate security controls.

## 📌 Future Improvements

- Backend integration and database storage
- Secure server-side authentication
- Dedicated password storage using a suitable password-hashing algorithm
- Financial reports and advanced analytics
- Data backup and synchronization across devices
- Additional financial planning tools

## 👨‍💻 Author

**Shri-ram-N**

GitHub: [@Shri-ram-N](https://github.com/Shri-ram-N)

## 📄 License

This project is intended for educational and personal learning purposes.

---

*Plan better. Track smarter. Grow financially.*
