const express = require('express');
require('dotenv').config();

const BookController = require('./controllers/BookController');
const LoanController = require('./controllers/LoanController');

const app = express();
app.use(express.json());

// Rotas de Livros
app.get('/api/books', BookController.getAll);
app.post('/api/books', BookController.create);

// Rotas de Empréstimos
app.post('/api/loans', LoanController.createLoan);
app.put('/api/loans/:id/return', LoanController.returnBook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando profissionalmente na porta ${PORT}`);
});
