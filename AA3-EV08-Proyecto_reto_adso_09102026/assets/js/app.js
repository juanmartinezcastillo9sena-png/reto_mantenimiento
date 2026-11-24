/* =========================================================
   Sistema de inventario - lógica de la interfaz
   Los datos iniciales están en datos.js; los cambios (registro y
   edición) se guardan en localStorage para que se vean en todas las pantallas.
   ========================================================= */

var CLAVE_PRODUCTOS = "inventario_productos";
var CLAVE_MENSAJE = "inventario_mensaje";
var ESTADOS_ACTIVOS = ["Activo", "Disponible"];

/* ---------- Utilidades de datos ---------- */
function cargarProductos() {
  try {
    var guardado = localStorage.getItem(CLAVE_PRODUCTOS);
    if (guardado) {
      var lista = JSON.parse(guardado);
      if (Array.isArray(lista)) {
        return lista;
      }
    }
  } catch (error) {
    /* si el almacenamiento no está disponible se usan los datos de datos.js */
  }
  return productos.map(function (item) {
    return Object.assign({}, item);
  });
}

function guardarProductos(lista) {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(lista));
  } catch (error) {
    /* sin almacenamiento los cambios solo viven en esta pantalla */
  }
}

function esActivo(estado) {
  return ESTADOS_ACTIVOS.indexOf(estado) !== -1;
}

function formatoPrecio(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

/* minúsculas y sin tildes: "lampara" encuentra "Lámpara" */
function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* Mensaje en pantalla (éxito o error) creado por JavaScript, sin tocar el HTML */
function mostrarMensaje(texto, tipo, referencia) {
  var mensaje = document.getElementById("mensaje-app");
  if (!mensaje) {
    mensaje = document.createElement("p");
    mensaje.id = "mensaje-app";
    mensaje.className = "mensaje-vacio";
    mensaje.setAttribute("role", "alert");
    mensaje.style.marginBottom = "16px";
    referencia.parentNode.insertBefore(mensaje, referencia);
  }
  mensaje.textContent = texto;
  if (tipo === "exito") {
    mensaje.style.background = "#e5f6ec";
    mensaje.style.color = "#1f7a4d";
  } else {
    mensaje.style.background = "#fdecea";
    mensaje.style.color = "#a33b32";
  }
}

/* ---------- Inicio: indicadores ---------- */
function iniciarInicio() {
  var lista = cargarProductos();
  document.getElementById("ind-total").textContent = lista.length;
  document.getElementById("ind-activos").textContent = lista.filter(function (p) {
    return esActivo(p.estado);
  }).length;
  document.getElementById("ind-categorias").textContent = categorias.length;
}

/* ---------- Detalle ---------- */
function iniciarDetalle() {
  var params = new URLSearchParams(window.location.search);
  var id = Number(params.get("id"));
  var producto = cargarProductos().find(function (item) {
    return item.id === id;
  });
  var mensaje = document.getElementById("mensaje-vacio");
  var panel = document.getElementById("panel-detalle");

  if (!producto) {
    mensaje.hidden = false;
    panel.hidden = true;
    return;
  }

  document.getElementById("d-nombre").textContent = producto.nombre;
  document.getElementById("d-categoria").textContent = producto.categoria;
  document.getElementById("d-precio").textContent = formatoPrecio(producto.precio);
  document.getElementById("d-cantidad").textContent = producto.cantidad;
  document.getElementById("d-estado").textContent = producto.estado;
  mensaje.hidden = true;
  panel.hidden = false;
}

/* ---------- Listado: render, búsqueda y filtro por estado ---------- */
function crearFila(producto) {
  var fila = document.createElement("tr");
  fila.dataset.id = producto.id;
  fila.dataset.nombre = producto.nombre;
  fila.dataset.categoria = producto.categoria;
  fila.dataset.estado = producto.estado;

  [producto.id, producto.nombre, producto.categoria, formatoPrecio(producto.precio), producto.cantidad].forEach(function (valor) {
    var celda = document.createElement("td");
    celda.textContent = valor;
    fila.appendChild(celda);
  });

  var celdaEstado = document.createElement("td");
  var etiqueta = document.createElement("span");
  etiqueta.className = esActivo(producto.estado) ? "badge-activo" : "badge-inactivo";
  etiqueta.textContent = producto.estado;
  celdaEstado.appendChild(etiqueta);
  fila.appendChild(celdaEstado);

  var celdaAcciones = document.createElement("td");
  var ver = document.createElement("a");
  ver.href = "detalle.html?id=" + producto.id;
  ver.textContent = "Ver";
  var editar = document.createElement("a");
  editar.className = "btn btn-secundario";
  editar.href = "registrar.html?id=" + producto.id;
  editar.textContent = "Editar";
  celdaAcciones.appendChild(ver);
  celdaAcciones.appendChild(document.createTextNode(" "));
  celdaAcciones.appendChild(editar);
  fila.appendChild(celdaAcciones);

  return fila;
}

function iniciarListado() {
  var cuerpo = document.getElementById("cuerpo-tabla");
  var contenedorTabla = document.getElementById("contenedor-tabla");
  var formBusqueda = document.getElementById("form-busqueda");
  var inputBuscar = document.getElementById("buscar");
  var botonLimpiar = document.getElementById("btn-limpiar");
  var selectEstado = document.getElementById("filtro-estado");
  var contador = document.getElementById("contador");
  var mensajeFiltro = document.getElementById("mensaje-filtro");

  /* La tabla se dibuja con los datos guardados (incluye lo editado o registrado) */
  cuerpo.innerHTML = "";
  cargarProductos().forEach(function (producto) {
    cuerpo.appendChild(crearFila(producto));
  });

  /* Mensaje que dejó la pantalla de edición (si lo hay) */
  var pendiente = null;
  try {
    pendiente = sessionStorage.getItem(CLAVE_MENSAJE);
    sessionStorage.removeItem(CLAVE_MENSAJE);
  } catch (error) {
    /* sin almacenamiento de sesión simplemente no hay mensaje pendiente */
  }
  if (pendiente) {
    mostrarMensaje(pendiente, "exito", document.querySelector("main .tarjeta"));
  }

  function aplicarFiltros() {
    var termino = normalizar(inputBuscar.value);
    var filtro = selectEstado.value;
    var visibles = 0;

    Array.prototype.forEach.call(cuerpo.querySelectorAll("tr"), function (fila) {
      var coincideTexto =
        termino === "" ||
        normalizar(fila.dataset.nombre).indexOf(termino) !== -1 ||
        normalizar(fila.dataset.categoria).indexOf(termino) !== -1;
      var activo = esActivo(fila.dataset.estado);
      var coincideEstado =
        filtro === "todos" || (filtro === "activos" && activo) || (filtro === "inactivos" && !activo);
      var mostrar = coincideTexto && coincideEstado;
      fila.hidden = !mostrar;
      if (mostrar) {
        visibles++;
      }
    });

    contador.textContent = "Mostrando " + visibles + (visibles === 1 ? " producto" : " productos");
    contenedorTabla.hidden = visibles === 0;
    mensajeFiltro.hidden = visibles !== 0;

    if (visibles === 0) {
      if (termino !== "") {
        mensajeFiltro.textContent = "No se encontraron productos que coincidan con la búsqueda";
      } else if (filtro !== "todos") {
        mensajeFiltro.textContent = "No hay productos registrados con este estado";
      } else {
        mensajeFiltro.textContent = "No hay productos registrados";
      }
    }
  }

  formBusqueda.addEventListener("submit", function (evento) {
    evento.preventDefault();
    aplicarFiltros();
  });

  /* Al borrar el texto el listado se restablece solo */
  inputBuscar.addEventListener("input", function () {
    if (inputBuscar.value.trim() === "") {
      aplicarFiltros();
    }
  });

  botonLimpiar.addEventListener("click", function () {
    inputBuscar.value = "";
    aplicarFiltros();
    inputBuscar.focus();
  });

  selectEstado.addEventListener("change", aplicarFiltros);

  aplicarFiltros();
}

/* ---------- Registro y edición ---------- */
function iniciarRegistro() {
  var formulario = document.getElementById("form-producto");
  var campoId = document.getElementById("id-producto");
  var campoNombre = document.getElementById("nombre");
  var campoPrecio = document.getElementById("precio");
  var campoCantidad = document.getElementById("cantidad");
  var campoEstado = document.getElementById("estado");
  var campoCategoria = document.getElementById("categoria");
  var boton = document.getElementById("btn-guardar");

  categorias.forEach(function (categoria) {
    var opcion = document.createElement("option");
    opcion.value = categoria.id;
    opcion.textContent = categoria.nombre;
    campoCategoria.appendChild(opcion);
  });

  /* Modo edición: registrar.html?id=N */
  var params = new URLSearchParams(window.location.search);
  if (params.has("id")) {
    var idEditar = Number(params.get("id"));
    var existente = cargarProductos().find(function (item) {
      return item.id === idEditar;
    });

    if (existente) {
      var categoriaActual = categorias.find(function (c) {
        return c.nombre === existente.categoria;
      });
      campoId.value = existente.id;
      campoNombre.value = existente.nombre;
      campoPrecio.value = existente.precio;
      campoCantidad.value = existente.cantidad;
      campoEstado.value = existente.estado;
      campoCategoria.value = categoriaActual ? categoriaActual.id : "";

      document.querySelector("main h1").textContent = "Editar producto";
      document.querySelector("main .resumen").textContent =
        "Modifica los datos del producto #" + existente.id + " y guarda los cambios.";
      boton.textContent = "Guardar cambios";
      document.title = "Editar · Sistema de inventario";
    } else {
      mostrarMensaje("No se encontró el producto que desea editar.", "error", formulario);
    }
  }

  function validar() {
    var errores = [];
    var precio = campoPrecio.value.trim();
    var cantidad = campoCantidad.value.trim();

    if (campoNombre.value.trim() === "") {
      errores.push("El nombre es obligatorio.");
    }
    if (precio === "" || isNaN(precio) || Number(precio) <= 0) {
      errores.push("El precio debe ser un número mayor que cero.");
    }
    if (cantidad === "" || !/^\d+$/.test(cantidad)) {
      errores.push("La cantidad debe ser un número entero igual o mayor que cero.");
    }
    if (campoEstado.value === "") {
      errores.push("Seleccione un estado.");
    }
    if (campoCategoria.value === "") {
      errores.push("Seleccione una categoría.");
    }
    return errores;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var errores = validar();
    if (errores.length > 0) {
      mostrarMensaje(errores.join(" "), "error", formulario);
      return;
    }

    var lista = cargarProductos();
    var categoriaElegida = categorias.find(function (c) {
      return String(c.id) === campoCategoria.value;
    });
    var datos = {
      nombre: campoNombre.value.trim(),
      precio: Number(campoPrecio.value),
      cantidad: Number(campoCantidad.value),
      estado: campoEstado.value,
      categoria: categoriaElegida.nombre
    };

    if (campoId.value !== "") {
      var id = Number(campoId.value);
      var posicion = lista.findIndex(function (item) {
        return item.id === id;
      });
      if (posicion === -1) {
        mostrarMensaje("No se encontró el producto que desea editar.", "error", formulario);
        return;
      }
      datos.id = id;
      lista[posicion] = datos;
      guardarProductos(lista);

      var textoExito = "El producto ha sido actualizado correctamente";
      try {
        sessionStorage.setItem(CLAVE_MENSAJE, textoExito);
      } catch (error) {
        /* el mensaje solo se mostrará en esta pantalla */
      }
      mostrarMensaje(textoExito, "exito", formulario);
      boton.disabled = true;
      setTimeout(function () {
        window.location.href = "productos.html";
      }, 1200);
    } else {
      var siguienteId = lista.reduce(function (mayor, item) {
        return Math.max(mayor, item.id);
      }, 0) + 1;
      datos.id = siguienteId;
      lista.push(datos);
      guardarProductos(lista);
      mostrarMensaje("Producto registrado correctamente.", "exito", formulario);
      formulario.reset();
    }
  });
}

/* ---------- Arranque según la pantalla ---------- */
if (document.getElementById("ind-total")) {
  iniciarInicio();
}

if (document.getElementById("detalle-producto")) {
  iniciarDetalle();
}

if (document.getElementById("cuerpo-tabla")) {
  iniciarListado();
}

if (document.getElementById("form-producto")) {
  iniciarRegistro();
}
