const LoanModel = require('../models/LoanModel');

const LoanController = {
  async createLoan(req, res) {
    const { usuario_id, livro_id } = req.body;
    if (!usuario_id || !livro_id) {
      return res.status(400).json({ error: 'Usuário e Livro são obrigatórios.' });
    }
    try {
      const loan = await LoanModel.startLoanTransaction(usuario_id, livro_id);
      return res.status(201).json({ message: 'Empréstimo efetuado!', loan });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async returnBook(req, res) {
    const { id } = req.params;
    try {
      const result = await LoanModel.processReturnTransaction(id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
};

module.exports = LoanController;
