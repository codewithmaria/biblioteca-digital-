
const { Pool } = require('pg');
require('dotenv').config();

// nova instância do pool local para gerenciar o client da transação
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const LoanModel = {
  async startLoanTransaction(usuario_id, livro_id, diasPrazo = 14) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. verificação da existência e disponibilidade do livro
      const bookCheck = await client.query('SELECT quantidade_disponivel FROM livros WHERE id = $1 FOR UPDATE', [livro_id]);
      if (bookCheck.rows.length === 0) throw new Error('Livro não encontrado');
      
      const estoque = bookCheck.rows[0].quantidade_disponivel;
      if (estoque <= 0) throw new Error('Livro indisponível em estoque');

      // 2. registro do emprestimo
      const dataDevolucaoPrevista = new Date();
      dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + diasPrazo);

      const loanQuery = `
        INSERT INTO emprestimos (usuario_id, livro_id, data_devolucao_prevista)
        VALUES ($1, $2, $3) RETURNING *
      `;
      const loanResult = await client.query(loanQuery, [usuario_id, livro_id, dataDevolucaoPrevista]);

      // 3. atualização do estoque do livro
      await client.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = $1', [livro_id]);

      await client.query('COMMIT');
      return loanResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async processReturnTransaction(emprestimo_id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. busca de empréstimo ativo
      const loanCheck = await client.query('SELECT libro_id, status FROM emprestimos WHERE id = $1', [emprestimo_id]);
      if (loanCheck.rows.length === 0) throw new Error('Empréstimo não encontrado');
      if (loanCheck.rows[0].status === 'devolvido') throw new Error('Este empréstimo já foi devolvido');

      const livro_id = loanCheck.rows[0].libro_id;

      // 2. atualização do status do empréstimo
      await client.query(`
        UPDATE emprestimos 
        SET data_devolucao_real = CURRENT_DATE, status = 'devolvido' 
        WHERE id = $1
      `, [emprestimo_id]);

      // 3. devolução do livro ao estoque
      await client.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = $1', [livro_id]);

      await client.query('COMMIT');
      return { message: 'Devolução realizada com sucesso' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = LoanModel;
