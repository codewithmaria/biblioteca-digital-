-- criação da tabela user
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- criação da tabela de Livros com índice para busca rápida por title
CREATE TABLE IF NOT EXISTS livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    genero VARCHAR(50),
    quantidade_disponivel INT NOT NULL DEFAULT 1 CHECK (quantidade_disponivel >= 0)
);

CREATE INDEX IF NOT EXISTS idx_livros_titulo ON livros(titulo);

-- criação da tabela de loan
CREATE TABLE IF NOT EXISTS emprestimos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE RESTRICT,
    livro_id INT REFERENCES livros(id) ON DELETE RESTRICT,
    data_emprestimo DATE DEFAULT CURRENT_DATE,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'devolvido', 'atrasado'))
);
