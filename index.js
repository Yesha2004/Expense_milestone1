const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory database
let expenses = [];

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Personal Expense Tracker API!',
        routes: {
            addExpense: 'POST /expenses',
            getExpenses: 'GET /expenses',
            analyzeSpending: 'GET /expenses/analysis',
        },
    });
});

// POST /expenses: Add a new expense
app.post('/expenses', (req, res) => {
    const { category, amount, date } = req.body;

    if (!category || !amount || !date || amount <= 0) {
        return res.status(400).json({ status: 'error', error: 'Invalid data' });
    }

    expenses.push({ category, amount, date });
    res.json({ status: 'success', data: 'Expense added successfully' });
});

// GET /expenses: Retrieve expenses with optional filters
app.get('/expenses', (req, res) => {
    const { category, startDate, endDate } = req.query;

    let filteredExpenses = expenses;

    if (category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    }

    if (startDate && endDate) {
        filteredExpenses = filteredExpenses.filter(exp => {
            return exp.date >= startDate && exp.date <= endDate;
        });
    }

    res.json({ status: 'success', data: filteredExpenses });
});

// GET /expenses/analysis: Analyze spending
app.get('/expenses/analysis', (req, res) => {
    const analysis = {};

    expenses.forEach(exp => {
        if (!analysis[exp.category]) {
            analysis[exp.category] = 0;
        }
        analysis[exp.category] += exp.amount;
    });

    const highestCategory = Object.keys(analysis).reduce((a, b) => analysis[a] > analysis[b] ? a : b);

    res.json({
        status: 'success',
        data: {
            totalByCategory: analysis,
            highestSpendingCategory: highestCategory,
        },
    });
});

const cron = require('node-cron');

// CRON job: Generate daily summary
cron.schedule('0 0 * * *', () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyExpenses = expenses.filter(exp => exp.date === today);

    console.log(`Daily Summary (${today}):`, dailyExpenses);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
