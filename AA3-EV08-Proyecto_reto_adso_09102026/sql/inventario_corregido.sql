-- =========================================================================
-- SISTEMA DE INVENTARIO - SCRIPT CORREGIDO (AA3-EV08)
-- Corrige los 12 errores de bd_inventario_productos_con_errores.sql y usa
-- los mismos datos de ejemplo que assets/js/datos.js.
-- Importar desde phpMyAdmin (XAMPP) -> Importar.
-- =========================================================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS sistema_inventario
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_inventario;

DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;

-- La tabla padre (categorias) se crea ANTES que la hija (productos)
CREATE TABLE categorias (
    id_categoria     INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto  INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100)  NOT NULL,
    precio       DECIMAL(12,2) NOT NULL,
    cantidad     INT           NOT NULL DEFAULT 0,
    estado       ENUM('Activo','Disponible','Inactivo','Sin Stock') NOT NULL DEFAULT 'Disponible',
    categoria_id INT           NOT NULL,
    CONSTRAINT chk_precio   CHECK (precio > 0),
    CONSTRAINT chk_cantidad CHECK (cantidad >= 0),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO categorias (nombre_categoria) VALUES ('Tecnología'), ('Hogar'), ('Moda');

INSERT INTO productos (nombre, precio, cantidad, estado, categoria_id) VALUES
('Laptop HP Pavilion',      3200000, 10, 'Activo',   1),
('Televisor Samsung 55"',   2100000,  5, 'Activo',   1),
('Licuadora Oster',          180000,  0, 'Inactivo', 2),
('Camisa manga larga',        75000, 40, 'Activo',   3),
('Mouse inalámbrico',         65000, 25, 'Activo',   1),
('Lámpara de escritorio',     90000,  8, 'Inactivo', 2),
('Zapatos deportivos',       180000, 15, 'Activo',   3),
('Teclado mecánico',         250000, 12, 'Activo',   1),
('Cafetera',                 160000,  0, 'Inactivo', 2),
('Chaqueta impermeable',     210000,  7, 'Activo',   3);
