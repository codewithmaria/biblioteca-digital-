const db = require('../config/db');

const BookModel = {
  async findAll() {
    const result = await db.query('SELECT * FROM livros ORDER BY titulo ASC');
    return result.rows;
  },

  async create({ titulo, autor, isbn, genero, quantidade_disponivel }) {
    const queryText = `
      INSERT INTO livros (titulo, autor, isbn, genero, quantidade_disponivel)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [titulo, autor, isbn, genero, quantidade_disponivel];
    const result = await db.query(queryText, values);
    return result.rows[0];
  }
};

module.exports = BookModel;
