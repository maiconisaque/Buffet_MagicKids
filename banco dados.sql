CREATE DATABASE IF NOT EXISTS magic_kids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE magic_kids;

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    nome_aniversariante VARCHAR(100),
    tema VARCHAR(100),
    qnt_convidados INT,
    data_festa DATE NOT NULL,
    turno VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT uq_data_turno UNIQUE (data_festa, turno)
) ENGINE=InnoDB;