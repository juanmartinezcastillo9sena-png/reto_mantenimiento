# Sistema de inventario

Proyecto de la actividad **AA3-EV08 – Reto de mantenimiento y evolución de un proyecto Front-End** (ADSO – SENA).
Permite consultar productos, ver el detalle de un registro, registrar productos nuevos y editarlos.

## Cómo ejecutarlo

1. Copia esta carpeta dentro de `htdocs` en XAMPP.
2. Inicia Apache desde el panel de XAMPP.
3. Abre el navegador en `http://localhost/AA3-EV08-Proyecto_reto_adso_09102026/index.html`.

También puedes abrir `index.html` directamente en el navegador.

## Pantallas

- Inicio (indicadores calculados con los datos)
- Listado de productos (búsqueda, filtro por estado y botón Editar)
- Registro / edición de producto (`registrar.html` y `registrar.html?id=N`)
- Detalle de producto

## Nueva funcionalidad

- **Requerimiento 1 – Búsqueda:** campo de texto con botones *Buscar* y *Limpiar*; filtra por nombre o categoría y muestra un mensaje cuando no hay coincidencias.
- **Requerimiento 2 – Edición:** botón *Editar* en la columna *Acciones*; carga los datos en el formulario, valida con JavaScript y confirma con "El producto ha sido actualizado correctamente".
- **Requerimiento 3 – Filtro por estado:** `<select>` Todos / Activos / Inactivos con contador de resultados y mensaje cuando no hay registros.

## Datos

Los datos de ejemplo están en `assets/js/datos.js`. Los productos registrados o editados se guardan en el `localStorage` del navegador. El proyecto no se conecta a MySQL; la carpeta `sql/` contiene el script original con errores y su versión corregida (`inventario_corregido.sql`).
