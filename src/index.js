const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { customers } = require('../models/Customers');
const app = express();

app.use(express.json());

/**
 * ID - UUID
 * CPF - String
 * Nome - String
 * Extratos - Array
 */

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

app.get('/statement', (req, res) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({
      error: 'Customer not found!',
    });
  }

  return res.json(customer.statement);
});

app.listen(3333);
