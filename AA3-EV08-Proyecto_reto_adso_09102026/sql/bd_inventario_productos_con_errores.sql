-- =========================================================================
-- SCRIPT SQL PARA BASE DE DATOS: SISTEMA DE INVENTARIO (CON ERRORES ADREDE)
-- Diseñado para prácticas de estudiantes (Encontrar y corregir errores)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS sistema_inventario;
USE sistema_inventario;

-- -------------------------------------------------------------------------
-- ERROR 1 (Falta de lógica): Creación de tabla 'productos' antes que 'categorias'.
-- Si se ejecuta en orden con la llave foránea activa, fallará inmediatamente.
-- -------------------------------------------------------------------------
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    -- ERROR 2 (Tipo de dato pésimo): El precio guardado como TEXT impide cálculos matemáticos o filtros de rango numérico eficientes.
    precio TEXT NOT NULL, 
    -- ERROR 3 (Inconsistencia de nombres): Aquí se llama 'cantidad', pero en los requerimientos se pide 'cantidades disponibles'. No tiene valor por defecto (debería ser 0).
    cantidad INT, 
    -- ERROR 4 (Error de diseño/Falta de normalización): El estado se escribe como texto libre en lugar de un ENUM o tabla auxiliar. Permite erratas como 'actvo' o 'Inatctivo'.
    estado VARCHAR(50) DEFAULT 'Disponible',
    categoria_id INT,
    -- ERROR 5 (Sintaxis / Integridad): Intento de crear una FK apuntando a una tabla que aún no existe en este punto del script.
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria)
);

-- -------------------------------------------------------------------------
-- TABLA: categorias
-- -------------------------------------------------------------------------
CREATE TABLE categorias (
    -- ERROR 6 (Inconsistencia de tipos): 'id_categoria' es INT, pero no tiene AUTO_INCREMENT. Obligará a insertar IDs manualmente, rompiendo la automatización.
    id_categoria INT PRIMARY KEY,
    -- ERROR 7 (Limitación absurda): VARCHAR(5) es demasiado corto para nombres de categorías comunes (ej. 'Electrónica' se cortará).
    nombre_categoria VARCHAR(5) NOT NULL
);

-- -------------------------------------------------------------------------
-- INSERCIÓN DE DATOS DE PRUEBA (Contiene inconsistencias lógicas y errores de datos)
-- -------------------------------------------------------------------------

-- Nota: Para que este script corra a pesar del Error 1 y 5, el estudiante tendría que desactivar temporalmente las llaves foráneas, lo cual es otra pista de diseño deficiente.
SET FOREIGN_KEY_CHECKS = 0;

-- Inserciones en categorias (Violando el límite de VARCHAR(5) si no se corrige antes)
-- ERROR 8: 'Tecnología' y 'Hogar' superan el límite de 5 caracteres. En modo estricto de MySQL, esto fallará.
INSERT INTO categorias (id_categoria, nombre_categoria) VALUES (1, 'Tecnología');
INSERT INTO categorias (id_categoria, nombre_categoria) VALUES (2, 'Hogar');
INSERT INTO categorias (id_categoria, nombre_categoria) VALUES (3, 'Moda');

-- Inserciones en productos
-- ERROR 9 (Datos basura y tipos erróneos): Precios con signos de moneda e inconsistentes ('$1200', 'Gratis', '850.50').
-- ERROR 10 (Estados inconsistentes): 'Activo', 'Disponible', 'Sin Stock'. No hay estandarización.
-- ERROR 11 (Llave foránea huérfana): El producto 4 apunta a la categoría 99, la cual no existe.
INSERT INTO productos (nombre, precio, cantidad, estado, categoria_id) VALUES 
('Laptop HP Pavillion', '$1200', 10, 'Activo', 1),
('Televisor Samsung 55', '850.50', -5, 'Disponible', 1), -- ERROR 12: Cantidad negativa (-5) en un inventario físico.
('Licuadora Oster', 'Gratis', 0, 'Sin Stock', 2),
('Camisa Manga Larga', '45.00', 100, 'Disponible', 99); 

SET FOREIGN_KEY_CHECKS = 1;
