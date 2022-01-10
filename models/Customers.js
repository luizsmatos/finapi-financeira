const customers = [];

function getBalance(statement) {
  return statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    }

    return acc - operation.amount;
  }, 0);
}

module.exports = {
  customers,
  getBalance,
};
