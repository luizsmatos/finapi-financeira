const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { customers, getBalance } = require('../models/Customers');
const app = express();

app.use(express.json());

/**
 * ID - UUID
 * CPF - String
 * Nome - String
 * Extratos - Array
 */

// Middleware
function verifyCustomerExists(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({
      error: 'Customer not found!',
    });
  }
  req.customer = customer;
  return next();
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({
      error: 'Customer already exists!',
    });
  }

  customers.push({
    id: uuidv4(),
    cpf,
    name,
    statement: [],
  });

  return res.status(201).json({ message: 'Customer created' });
});

app.get('/statement', verifyCustomerExists, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});

app.post('/deposit', verifyCustomerExists, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statmentOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statmentOperation);

  return res.status(201).json({ message: 'Deposit successful' });
});

app.post('/withdraw', verifyCustomerExists, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({
      error: 'Insufficient funds!',
    });
  }

  const statmentOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };
  customer.statement.push(statmentOperation);

  return res.status(201).json({ message: 'Withdraw successful' });
});

app.get('/statement/date', verifyCustomerExists, (req, res) => {
  const { date } = req.query;
  const { customer } = req;

  const dateFormatted = new Date(date + ' 00:00:00');

  const statement = customer.statement.filter(
    (operation) =>
      operation.created_at.toDateString() === dateFormatted.toDateString()
  );

  return res.json(statement);
});

app.put('/account', verifyCustomerExists, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).json({ message: 'Customer updated' });
})

app.get('/account', verifyCustomerExists, (req, res) => {
  const { customer } = req;

  return res.json(customer);
})

app.delete('/account', verifyCustomerExists, (req, res) => {
  const { customer } = req;

  customers.splice(customers.indexOf(customer), 1);

  return res.status(200).json({ message: 'Customer deleted' });
});


app.listen(3333);
