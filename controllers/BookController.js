const BookModel = require('../models/BookModel');

const BookController = {
  async getAll(req, res) {
    try {
      const books = await BookModel.findAll();
      return res.status(200).json(books);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar livros.' });
    }
  },

  async create(req, res) {
    const { titulo, autor, isbn, quantidade_disponivel } = req.body;
    if (!titulo || !autor || !isbn) {
      return res.status(400).json({ error: 'Campos obrigatórios: titulo, autor, isbn.' });
    }
    try {
      const newBook = await BookModel.create(req.body);
      return res.status(201).json(newBook);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao cadastrar livro. Verifique o ISBN único.' });
    }
  }
};

module.exports = BookController;
