const URL_PRODUCTOS = '/api/producto';
const URL_CLIENTES = '/api/clientes';
const URL_COMPRA = '/api/compra';
const URL_FACTURA = '/api/factura';

let listaProductos = [];
let listaClientes = [];
let carrito = [];
let clienteSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
  inicializarAplicacion();
});

function inicializarAplicacion() {
  configurarEventos();
  obtenerProductos();
  cargarClientes();
}

function configurarEventos() {
  const botonAbrirCarrito = document.getElementById('boton-abrir-carrito');
  const botonCerrarCarrito = document.getElementById('boton-cerrar-carrito');
  const modalCarrito = document.getElementById('modal-carrito');

  if (botonAbrirCarrito && modalCarrito) {
    botonAbrirCarrito.addEventListener('click', () => {
      abrirModal(modalCarrito);
    });
  }

  if (botonCerrarCarrito && modalCarrito) {
    botonCerrarCarrito.addEventListener('click', () => {
      cerrarModal(modalCarrito);
    });
  }

  const botonCerrarFactura = document.getElementById('boton-cerrar-factura');
  const modalFactura = document.getElementById('modal-factura');
  if (botonCerrarFactura && modalFactura) {
    botonCerrarFactura.addEventListener('click', () => {
      cerrarModal(modalFactura);
    });
  }

  const botonVerFacturas = document.getElementById('boton-ver-facturas');
  const modalHistorial = document.getElementById('modal-historial');
  const botonCerrarHistorial = document.getElementById('boton-cerrar-historial');

  if (botonVerFacturas && modalHistorial) {
    botonVerFacturas.addEventListener('click', (evento) => {
      evento.preventDefault();
      obtenerFacturas();
      abrirModal(modalHistorial);
    });
  }

  if (botonCerrarHistorial && modalHistorial) {
    botonCerrarHistorial.addEventListener('click', () => {
      cerrarModal(modalHistorial);
    });
  }

  const selectorCliente = document.getElementById('selector-cliente');
  if (selectorCliente) {
    selectorCliente.addEventListener('change', (evento) => {
      seleccionarClientePorId(evento.target.value);
    });
  }

  const formularioRegistro = document.getElementById('formulario-registro');
  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', registrarCliente);
  }

  const botonProcesar = document.getElementById('boton-procesar-compra');
  if (botonProcesar) {
    botonProcesar.addEventListener('click', procesarCompra);
  }

  const campoBusqueda = document.getElementById('campo-busqueda');
  if (campoBusqueda) {
    campoBusqueda.addEventListener('input', (evento) => {
      filtrarProductos(evento.target.value);
    });
  }

  const botonReintentar = document.getElementById('boton-reintentar-catalogo');
  if (botonReintentar) {
    botonReintentar.addEventListener('click', () => {
      obtenerProductos();
      cargarClientes();
    });
  }

  const botonAbrirAdmin = document.getElementById('boton-abrir-admin');
  const botonCerrarAdmin = document.getElementById('boton-cerrar-admin');
  const modalAdmin = document.getElementById('modal-admin');

  if (botonAbrirAdmin && modalAdmin) {
    botonAbrirAdmin.addEventListener('click', () => {
      renderizarTablaAdmin(listaProductos);
      abrirModal(modalAdmin);
    });
  }

  if (botonCerrarAdmin && modalAdmin) {
    botonCerrarAdmin.addEventListener('click', () => {
      cerrarModal(modalAdmin);
    });
  }

  const botonAlternarNuevo = document.getElementById('boton-alternar-nuevo-peluche');
  const cajaNuevoPeluche = document.getElementById('caja-nuevo-peluche');
  if (botonAlternarNuevo && cajaNuevoPeluche) {
    botonAlternarNuevo.addEventListener('click', () => {
      const estaOculto = cajaNuevoPeluche.style.display === 'none';
      cajaNuevoPeluche.style.display = estaOculto ? 'block' : 'none';
    });
  }

  const formularioNuevoPeluche = document.getElementById('formulario-nuevo-peluche');
  if (formularioNuevoPeluche) {
    formularioNuevoPeluche.addEventListener('submit', crearNuevoPeluche);
  }

  const botonReabastecerTodo = document.getElementById('boton-reabastecer-todo');
  if (botonReabastecerTodo) {
    botonReabastecerTodo.addEventListener('click', () => {
      reabastecerTodoElStock(10);
    });
  }

  const campoBusquedaAdmin = document.getElementById('campo-busqueda-admin');
  if (campoBusquedaAdmin) {
    campoBusquedaAdmin.addEventListener('input', (evento) => {
      filtrarProductosAdmin(evento.target.value);
    });
  }
}

async function obtenerProductos() {
  const estadoCarga = document.getElementById('estado-carga');
  const mensajeError = document.getElementById('mensaje-error-conexion');
  const contenedorProductos = document.getElementById('contenedor-productos');

  if (estadoCarga) estadoCarga.style.display = 'block';
  if (mensajeError) mensajeError.style.display = 'none';
  if (contenedorProductos) contenedorProductos.innerHTML = '';

  try {
    const respuesta = await fetch(URL_PRODUCTOS);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const productos = await respuesta.json();
    listaProductos = Array.isArray(productos) ? productos : [];
    
    if (estadoCarga) estadoCarga.style.display = 'none';
    renderizarCatalogo(listaProductos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    if (estadoCarga) estadoCarga.style.display = 'none';
    if (mensajeError) mensajeError.style.display = 'block';
    mostrarNotificacion('Error de conexion con la API de productos', 'error');
  }
}

function renderizarCatalogo(productos) {
  const contenedor = document.getElementById('contenedor-productos');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (productos.length === 0) {
    contenedor.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #636e72;">
        No se encontraron peluches disponibles en este momento.
      </div>
    `;
    return;
  }

  productos.forEach((producto) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    const iconoPeluche = obtenerIconoPeluche(producto.nombre);
    const hayStock = producto.stock > 0;
    const claseStock = hayStock ? 'stock-disponible' : 'stock-agotado';
    const textoStock = hayStock ? `${producto.stock} disponibles` : 'Sin stock';

    tarjeta.innerHTML = `
      <div class="contenedor-imagen-tarjeta">
        <span>${iconoPeluche}</span>
        <span class="insignia-stock ${claseStock}">${textoStock}</span>
      </div>
      <div class="cuerpo-tarjeta">
        <h3 class="titulo-producto">${producto.nombre}</h3>
        <p class="informacion-stock">Codigo: #${producto.id} | Stock: ${producto.stock}</p>
        <div class="pie-tarjeta">
          <span class="precio-producto">${formatearDinero(producto.precio)}</span>
          <button 
            class="boton-aniadir" 
            data-id="${producto.id}"
            ${!hayStock ? 'disabled' : ''}
          >
            <span>+</span>
            <span>${hayStock ? 'Aniadir' : 'Agotado'}</span>
          </button>
        </div>
      </div>
    `;

    const botonAniadir = tarjeta.querySelector('.boton-aniadir');
    if (botonAniadir && hayStock) {
      botonAniadir.addEventListener('click', () => {
        aniadirAlCarrito(producto.id);
      });
    }

    contenedor.appendChild(tarjeta);
  });
}

function normalizarTexto(cadena) {
  return (cadena || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function filtrarProductos(termino) {
  const busqueda = normalizarTexto(termino.trim());
  if (!busqueda) {
    renderizarCatalogo(listaProductos);
    return;
  }

  const filtrados = listaProductos.filter((producto) =>
    normalizarTexto(producto.nombre).includes(busqueda)
  );

  renderizarCatalogo(filtrados);
}

function aniadirAlCarrito(idProducto) {
  const producto = listaProductos.find((item) => item.id === idProducto);
  if (!producto) {
    mostrarNotificacion('El peluche seleccionado no existe', 'error');
    return;
  }

  const itemEnCarrito = carrito.find((item) => item.id === idProducto);
  const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  if (cantidadActual + 1 > producto.stock) {
    mostrarNotificacion(`Stock maximo alcanzado para "${producto.nombre}"`, 'alerta');
    return;
  }

  if (itemEnCarrito) {
    itemEnCarrito.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      cantidad: 1
    });
  }

  actualizarCarrito();
  mostrarNotificacion(`"${producto.nombre}" agregado al carrito`, 'exito');
}

function modificarCantidad(idProducto, cambio) {
  const indice = carrito.findIndex((item) => item.id === idProducto);
  if (indice === -1) return;

  const item = carrito[indice];
  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
    return;
  }

  if (nuevaCantidad > item.stock) {
    mostrarNotificacion(`No hay mas stock disponible de "${item.nombre}"`, 'alerta');
    return;
  }

  item.cantidad = nuevaCantidad;
  actualizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  const item = carrito.find((producto) => producto.id === idProducto);
  const nombre = item ? item.nombre : 'Producto';
  carrito = carrito.filter((producto) => producto.id !== idProducto);
  actualizarCarrito();
  mostrarNotificacion(`"${nombre}" eliminado del carrito`, 'alerta');
}

function actualizarCarrito() {
  const listaCarritoElemento = document.getElementById('lista-carrito');
  const contadorElemento = document.getElementById('contador-carrito');
  const subtotalElemento = document.getElementById('subtotal-compra');
  const ivaElemento = document.getElementById('iva-compra');
  const totalElemento = document.getElementById('total-compra');
  const botonProcesar = document.getElementById('boton-procesar-compra');

  let cantidadTotalItems = 0;
  let subtotalCalculado = 0;

  carrito.forEach((item) => {
    cantidadTotalItems += item.cantidad;
    subtotalCalculado += item.precio * item.cantidad;
  });

  const ivaCalculado = subtotalCalculado * 0.21;
  const totalCalculado = subtotalCalculado + ivaCalculado;

  if (contadorElemento) contadorElemento.textContent = cantidadTotalItems;
  if (subtotalElemento) subtotalElemento.textContent = formatearDinero(subtotalCalculado);
  if (ivaElemento) ivaElemento.textContent = formatearDinero(ivaCalculado);
  if (totalElemento) totalElemento.textContent = formatearDinero(totalCalculado);

  if (botonProcesar) {
    botonProcesar.disabled = carrito.length === 0;
  }

  if (!listaCarritoElemento) return;

  if (carrito.length === 0) {
    listaCarritoElemento.innerHTML = `
      <div class="carrito-vacio-mensaje">
        <span class="icono-carrito-vacio">🛒</span>
        <p>Tu carrito esta vacio.</p>
        <p>Elige un peluche del catalogo para comenzar.</p>
      </div>
    `;
    return;
  }

  listaCarritoElemento.innerHTML = '';

  carrito.forEach((item) => {
    const fila = document.createElement('div');
    fila.className = 'elemento-carrito';

    const subtotalFila = item.precio * item.cantidad;

    fila.innerHTML = `
      <div class="info-elemento-carrito">
        <div class="nombre-elemento-carrito">${item.nombre}</div>
        <div class="precio-unitario-carrito">${formatearDinero(item.precio)} c/u</div>
      </div>
      <div class="controles-cantidad-carrito">
        <button class="boton-cantidad boton-restar">-</button>
        <span class="numero-cantidad">${item.cantidad}</span>
        <button class="boton-cantidad boton-sumar">+</button>
      </div>
      <div class="subtotal-elemento-carrito">${formatearDinero(subtotalFila)}</div>
      <button class="boton-eliminar-elemento" title="Eliminar">&times;</button>
    `;

    const botonRestar = fila.querySelector('.boton-restar');
    const botonSumar = fila.querySelector('.boton-sumar');
    const botonEliminar = fila.querySelector('.boton-eliminar-elemento');

    if (botonRestar) {
      botonRestar.addEventListener('click', () => modificarCantidad(item.id, -1));
    }
    if (botonSumar) {
      botonSumar.addEventListener('click', () => modificarCantidad(item.id, 1));
    }
    if (botonEliminar) {
      botonEliminar.addEventListener('click', () => eliminarDelCarrito(item.id));
    }

    listaCarritoElemento.appendChild(fila);
  });
}

const CLAVE_CACHE_CLIENTES = 'pelucheria_clientes_cache';
const CLAVE_CLIENTE_ACTIVO = 'pelucheria_cliente_activo_id';

async function cargarClientes() {
  const selector = document.getElementById('selector-cliente');
  if (!selector) return;

  restaurarClientesDesdeCache();

  try {
    const respuesta = await fetch(URL_CLIENTES);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const clientes = await respuesta.json();
    if (Array.isArray(clientes) && clientes.length > 0) {
      listaClientes = clientes;
      guardarClientesEnCache();
    }
  } catch (error) {
    console.warn('No se pudo actualizar clientes desde la API (posible bucle circular en backend). Utilizando lista local:', error);
  }

  poblarSelectorClientes();
}

function guardarClientesEnCache() {
  try {
    localStorage.setItem(CLAVE_CACHE_CLIENTES, JSON.stringify(listaClientes));
  } catch (error) {
    console.warn('Error al guardar cache de clientes:', error);
  }
}

function restaurarClientesDesdeCache() {
  try {
    const cache = localStorage.getItem(CLAVE_CACHE_CLIENTES);
    if (cache) {
      const parsed = JSON.parse(cache);
      if (Array.isArray(parsed) && parsed.length > 0) {
        listaClientes = parsed;
      }
    }
  } catch (error) {
    console.warn('Error al restaurar cache de clientes:', error);
  }
}

function poblarSelectorClientes() {
  const selector = document.getElementById('selector-cliente');
  if (!selector) return;

  selector.innerHTML = '<option value="">-- Seleccionar cliente existente --</option>';

  listaClientes.forEach((cliente) => {
    const opcion = document.createElement('option');
    opcion.value = cliente.id;
    opcion.textContent = `${cliente.nombre} ${cliente.apellido} (${cliente.correo})`;
    selector.appendChild(opcion);
  });

  const clienteGuardadoId = localStorage.getItem(CLAVE_CLIENTE_ACTIVO);
  if (clienteGuardadoId && listaClientes.some((c) => c.id === parseInt(clienteGuardadoId, 10))) {
    seleccionarClientePorId(clienteGuardadoId);
    selector.value = clienteGuardadoId;
  } else if (!clienteSeleccionado && listaClientes.length > 0) {
    seleccionarClientePorId(listaClientes[0].id);
    selector.value = listaClientes[0].id;
  }
}

function seleccionarClientePorId(idCliente) {
  const etiquetaClienteActivo = document.getElementById('etiqueta-cliente-activo');
  const etiquetaClienteResumen = document.getElementById('cliente-resumen-compra');

  if (!idCliente) {
    clienteSeleccionado = null;
    localStorage.removeItem(CLAVE_CLIENTE_ACTIVO);
    if (etiquetaClienteActivo) {
      etiquetaClienteActivo.textContent = 'Invitado (Sin registrar)';
    }
    if (etiquetaClienteResumen) {
      etiquetaClienteResumen.textContent = 'Sin seleccionar';
      etiquetaClienteResumen.style.color = '#d63031';
    }
    return;
  }

  const idNumero = parseInt(idCliente, 10);
  const clienteEncontrado = listaClientes.find((c) => c.id === idNumero);

  if (clienteEncontrado) {
    clienteSeleccionado = clienteEncontrado;
    localStorage.setItem(CLAVE_CLIENTE_ACTIVO, idCliente);
    if (etiquetaClienteActivo) {
      etiquetaClienteActivo.textContent = `${clienteEncontrado.nombre} ${clienteEncontrado.apellido} (${clienteEncontrado.cuit})`;
    }
    if (etiquetaClienteResumen) {
      etiquetaClienteResumen.textContent = `${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`;
      etiquetaClienteResumen.style.color = '#00876c';
    }
    mostrarNotificacion(`Sesion activa: ${clienteEncontrado.nombre} ${clienteEncontrado.apellido}`, 'exito');
  }
}

async function registrarCliente(evento) {
  evento.preventDefault();

  const nombre = document.getElementById('nombre-cliente').value.trim();
  const apellido = document.getElementById('apellido-cliente').value.trim();
  const correo = document.getElementById('correo-cliente').value.trim();
  const contrasena = document.getElementById('contrasena-cliente').value.trim();
  const cuit = document.getElementById('cuit-cliente').value.trim();
  const direccion = document.getElementById('direccion-cliente').value.trim();

  if (!nombre || !apellido || !correo || !contrasena || !cuit || !direccion) {
    mostrarNotificacion('Por favor completa todos los campos del formulario', 'alerta');
    return;
  }

  const nuevoCliente = {
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    contrasena: contrasena,
    direccion: direccion,
    cuit: cuit
  };

  const botonRegistro = document.getElementById('boton-registro');
  if (botonRegistro) {
    botonRegistro.disabled = true;
    botonRegistro.textContent = 'Registrando...';
  }

  try {
    const respuesta = await fetch(URL_CLIENTES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoCliente)
    });

    if (!respuesta.ok) {
      throw new Error(`Error en el servidor: ${respuesta.status}`);
    }

    const clienteGuardado = await respuesta.json();
    listaClientes.push(clienteGuardado);
    guardarClientesEnCache();

    const selector = document.getElementById('selector-cliente');
    if (selector) {
      const opcion = document.createElement('option');
      opcion.value = clienteGuardado.id;
      opcion.textContent = `${clienteGuardado.nombre} ${clienteGuardado.apellido} (${clienteGuardado.correo})`;
      selector.appendChild(opcion);
      selector.value = clienteGuardado.id;
    }

    seleccionarClientePorId(clienteGuardado.id);
    evento.target.reset();
    mostrarNotificacion('Cliente registrado con exito!', 'exito');
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    mostrarNotificacion('No se pudo registrar el cliente. Intenta nuevamente.', 'error');
  } finally {
    if (botonRegistro) {
      botonRegistro.disabled = false;
      botonRegistro.textContent = 'Registrar Nuevo Cliente';
    }
  }
}

async function procesarCompra() {
  if (carrito.length === 0) {
    mostrarNotificacion('El carrito esta vacio', 'alerta');
    return;
  }

  if (!clienteSeleccionado) {
    mostrarNotificacion('Selecciona o registra un cliente para procesar la compra', 'alerta');
    const modalCarrito = document.getElementById('modal-carrito');
    if (modalCarrito) cerrarModal(modalCarrito);
    window.location.hash = '#seccion-registro';
    return;
  }

  let subtotal = 0;
  const listaProductosCompra = [];

  carrito.forEach((item) => {
    subtotal += item.precio * item.cantidad;
    for (let i = 0; i < item.cantidad; i++) {
      listaProductosCompra.push({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        stock: item.stock
      });
    }
  });

  const subtotalRedondeado = Math.round(subtotal * 100) / 100;
  const totalRedondeado = Math.round((subtotal * 1.21) * 100) / 100;

  const datosCompra = {
    iva: 21,
    subtotal: subtotalRedondeado,
    total: totalRedondeado,
    cliente: {
      id: clienteSeleccionado.id,
      nombre: clienteSeleccionado.nombre,
      apellido: clienteSeleccionado.apellido,
      correo: clienteSeleccionado.correo,
      direccion: clienteSeleccionado.direccion,
      cuit: clienteSeleccionado.cuit
    },
    factura: {
      nomcli: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
      iva: 21,
      subtotal: subtotalRedondeado,
      total: totalRedondeado
    }
  };

  const botonProcesar = document.getElementById('boton-procesar-compra');
  if (botonProcesar) {
    botonProcesar.disabled = true;
    botonProcesar.textContent = 'Procesando compra...';
  }

  try {
    const respuesta = await fetch(URL_COMPRA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosCompra)
    });

    if (!respuesta.ok) {
      let mensajeErrorServidor = `Error en el servidor (${respuesta.status})`;
      try {
        const errorJson = await respuesta.json();
        if (errorJson && errorJson.message) {
          mensajeErrorServidor = errorJson.message;
        }
      } catch (e) {
        // Formato no JSON
      }
      throw new Error(mensajeErrorServidor);
    }

    const resultadoCompra = await respuesta.json();
    mostrarNotificacion('Compra procesada con exito!', 'exito');

    const modalCarrito = document.getElementById('modal-carrito');
    if (modalCarrito) cerrarModal(modalCarrito);

    const articulosComprados = carrito.map((item) => ({ ...item }));
    mostrarComprobanteFactura(resultadoCompra, datosCompra, articulosComprados);

    await descontarStockDePeluches(articulosComprados);

    carrito = [];
    actualizarCarrito();
  } catch (error) {
    console.error('Error al procesar compra:', error);
    mostrarNotificacion(`No se pudo procesar la compra: ${error.message || 'Error de conexion'}`, 'error');
  } finally {
    if (botonProcesar) {
      botonProcesar.disabled = false;
      botonProcesar.textContent = 'Procesar Orden de Compra';
    }
  }
}

function mostrarComprobanteFactura(resultado, datosCompra, articulosComprados) {
  const modalFactura = document.getElementById('modal-factura');
  const detalleFactura = document.getElementById('detalle-factura');
  if (!modalFactura || !detalleFactura) return;

  const idFactura = resultado && resultado.factura && resultado.factura.id
    ? resultado.factura.id
    : (resultado && resultado.id ? resultado.id : 'N/A');

  const fechaActual = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let itemsHtml = '';
  articulosComprados.forEach((item) => {
    const totalItem = item.precio * item.cantidad;
    itemsHtml += `
      <div class="item-factura-fila">
        <span>${item.cantidad}x ${item.nombre}</span>
        <span>${formatearDinero(totalItem)}</span>
      </div>
    `;
  });

  detalleFactura.innerHTML = `
    <div class="cabecera-factura">
      <h4>PELUCHERIA S.A.</h4>
      <p style="font-size: 0.85rem; color: #636e72;">Factura B - Comprobante de Compra #${idFactura}</p>
      <p style="font-size: 0.85rem; color: #636e72;">Fecha: ${fechaActual}</p>
    </div>
    <div style="margin-bottom: 1rem; font-size: 0.9rem;">
      <p><strong>Cliente:</strong> ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}</p>
      <p><strong>CUIT:</strong> ${clienteSeleccionado.cuit}</p>
      <p><strong>Direccion:</strong> ${clienteSeleccionado.direccion}</p>
      <p><strong>Correo:</strong> ${clienteSeleccionado.correo}</p>
    </div>
    <div class="items-factura-lista">
      ${itemsHtml}
    </div>
    <div class="resumen-totales-compra" style="margin-bottom: 0;">
      <div class="fila-resumen">
        <span>Subtotal Neto:</span>
        <span>${formatearDinero(datosCompra.subtotal)}</span>
      </div>
      <div class="fila-resumen">
        <span>IVA (21%):</span>
        <span>${formatearDinero(datosCompra.total - datosCompra.subtotal)}</span>
      </div>
      <div class="fila-resumen fila-total">
        <span>Total Pagado:</span>
        <span class="monto-total-destacado">${formatearDinero(datosCompra.total)}</span>
      </div>
    </div>
  `;

  abrirModal(modalFactura);
}

async function obtenerFacturas() {
  const listaHistorial = document.getElementById('lista-historial');
  if (!listaHistorial) return;

  listaHistorial.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div class="spinner-cargando"></div>
      <p>Cargando facturas registradas...</p>
    </div>
  `;

  try {
    const respuesta = await fetch(URL_FACTURA);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const facturas = await respuesta.json();
    if (!Array.isArray(facturas) || facturas.length === 0) {
      listaHistorial.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #636e72;">
          No hay facturas emitidas registradas en el sistema.
        </div>
      `;
      return;
    }

    listaHistorial.innerHTML = '';
    facturas.forEach((factura) => {
      const elemento = document.createElement('div');
      elemento.className = 'elemento-carrito';
      elemento.innerHTML = `
        <div class="info-elemento-carrito">
          <div class="nombre-elemento-carrito">Factura #${factura.id} - ${factura.nomcli || 'Cliente'}</div>
          <div class="precio-unitario-carrito">Subtotal: ${formatearDinero(factura.subtotal)} | IVA: ${factura.iva}%</div>
        </div>
        <div class="subtotal-elemento-carrito">${formatearDinero(factura.total)}</div>
      `;
      listaHistorial.appendChild(elemento);
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    listaHistorial.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #d63031;">
        No se pudieron cargar las facturas. Asegurate de que el servidor este en linea.
      </div>
    `;
  }
}

function abrirModal(modal) {
  if (modal) {
    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
  }
}

function cerrarModal(modal) {
  if (modal) {
    modal.classList.remove('activo');
    document.body.style.overflow = 'auto';
  }
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('contenedor-notificaciones');
  if (!contenedor) return;

  const notificacion = document.createElement('div');
  notificacion.className = `notificacion-toast notificacion-${tipo}`;

  let icono = '✔';
  if (tipo === 'error') icono = '✖';
  if (tipo === 'alerta') icono = '⚠';

  notificacion.innerHTML = `<span>${icono}</span><span>${mensaje}</span>`;
  contenedor.appendChild(notificacion);

  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateY(20px)';
    notificacion.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (notificacion.parentElement) {
        notificacion.parentElement.removeChild(notificacion);
      }
    }, 300);
  }, 3500);
}

function formatearDinero(monto) {
  const numero = parseFloat(monto) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(numero);
}

function obtenerIconoPeluche(nombre) {
  const texto = normalizarTexto(nombre);
  if (texto.includes('panda')) return '🐼';
  if (texto.includes('gato')) return '🐱';
  if (texto.includes('capibara')) return '🥔';
  if (texto.includes('conejo')) return '🐰';
  if (texto.includes('pinguino')) return '🐧';
  if (texto.includes('hamster')) return '🐹';
  if (texto.includes('elefante')) return '🐘';
  if (texto.includes('cerdito')) return '🐷';
  if (texto.includes('patito')) return '🐥';
  if (texto.includes('zorro')) return '🦊';
  if (texto.includes('koala')) return '🐨';
  if (texto.includes('dino')) return '🦖';
  if (texto.includes('foca')) return '🦭';
  if (texto.includes('unicornio')) return '🦄';
  if (texto.includes('ovejita')) return '🐑';
  if (texto.includes('perrito') || texto.includes('pug')) return '🐶';
  if (texto.includes('tigre')) return '🐯';
  if (texto.includes('rana')) return '🐸';
  if (texto.includes('ballena')) return '🐳';
  if (texto.includes('buho')) return '🦉';
  return '🧸';
}

async function descontarStockDePeluches(articulosComprados) {
  for (const item of articulosComprados) {
    const productoActual = listaProductos.find((p) => p.id === item.id);
    if (!productoActual) continue;

    const stockRestante = Math.max(0, productoActual.stock - item.cantidad);
    productoActual.stock = stockRestante;

    try {
      await fetch(URL_PRODUCTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productoActual.id,
          nombre: productoActual.nombre,
          precio: productoActual.precio,
          stock: stockRestante
        })
      });
    } catch (error) {
      console.error(`Error al descontar stock del peluche ${item.nombre}:`, error);
    }
  }

  renderizarCatalogo(listaProductos);
  const modalAdmin = document.getElementById('modal-admin');
  if (modalAdmin && modalAdmin.classList.contains('activo')) {
    renderizarTablaAdmin(listaProductos);
  }
}

function renderizarTablaAdmin(productos) {
  const cuerpoTabla = document.getElementById('cuerpo-tabla-admin');
  if (!cuerpoTabla) return;

  cuerpoTabla.innerHTML = '';

  if (productos.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 1.5rem; color: #636e72;">
          No hay peluches que coincidan con la busqueda.
        </td>
      </tr>
    `;
    return;
  }

  productos.forEach((p) => {
    const fila = document.createElement('tr');
    const icono = obtenerIconoPeluche(p.nombre);
    const hayStock = p.stock > 0;
    const claseStock = hayStock ? 'stock-disponible' : 'stock-agotado';

    fila.innerHTML = `
      <td><strong>#${p.id}</strong></td>
      <td>
        <span style="font-size: 1.3rem; margin-right: 0.4rem;">${icono}</span>
        <strong>${p.nombre}</strong>
      </td>
      <td>${formatearDinero(p.precio)}</td>
      <td>
        <span class="insignia-stock ${claseStock}">${p.stock} uds</span>
      </td>
      <td>
        <div class="controles-ajuste-stock">
          <button class="boton-stock-ajuste boton-restar-cinco" data-id="${p.id}">-5</button>
          <button class="boton-stock-ajuste boton-restar-uno" data-id="${p.id}">-1</button>
          <input type="number" class="campo-stock-admin" id="input-stock-${p.id}" value="${p.stock}" min="0">
          <button class="boton-stock-ajuste boton-sumar-uno" data-id="${p.id}">+1</button>
          <button class="boton-stock-ajuste boton-sumar-cinco" data-id="${p.id}">+5</button>
          <button class="boton-stock-ajuste boton-sumar-diez" data-id="${p.id}">+10</button>
        </div>
      </td>
      <td>
        <button class="boton-guardar-stock" data-id="${p.id}">Guardar</button>
      </td>
    `;

    const inputStock = fila.querySelector(`#input-stock-${p.id}`);
    const botonRestarCinco = fila.querySelector('.boton-restar-cinco');
    const botonRestarUno = fila.querySelector('.boton-restar-uno');
    const botonSumarUno = fila.querySelector('.boton-sumar-uno');
    const botonSumarCinco = fila.querySelector('.boton-sumar-cinco');
    const botonSumarDiez = fila.querySelector('.boton-sumar-diez');
    const botonGuardar = fila.querySelector('.boton-guardar-stock');

    if (botonRestarCinco && inputStock) {
      botonRestarCinco.addEventListener('click', () => {
        inputStock.value = Math.max(0, parseInt(inputStock.value, 10) - 5);
      });
    }
    if (botonRestarUno && inputStock) {
      botonRestarUno.addEventListener('click', () => {
        inputStock.value = Math.max(0, parseInt(inputStock.value, 10) - 1);
      });
    }
    if (botonSumarUno && inputStock) {
      botonSumarUno.addEventListener('click', () => {
        inputStock.value = parseInt(inputStock.value, 10) + 1;
      });
    }
    if (botonSumarCinco && inputStock) {
      botonSumarCinco.addEventListener('click', () => {
        inputStock.value = parseInt(inputStock.value, 10) + 5;
      });
    }
    if (botonSumarDiez && inputStock) {
      botonSumarDiez.addEventListener('click', () => {
        inputStock.value = parseInt(inputStock.value, 10) + 10;
      });
    }
    if (botonGuardar && inputStock) {
      botonGuardar.addEventListener('click', () => {
        guardarStockProducto(p.id, inputStock.value);
      });
    }

    cuerpoTabla.appendChild(fila);
  });
}

function filtrarProductosAdmin(termino) {
  const busqueda = normalizarTexto(termino.trim());
  if (!busqueda) {
    renderizarTablaAdmin(listaProductos);
    return;
  }
  const filtrados = listaProductos.filter((p) =>
    normalizarTexto(p.nombre).includes(busqueda)
  );
  renderizarTablaAdmin(filtrados);
}

async function guardarStockProducto(idProducto, nuevoStock) {
  const producto = listaProductos.find((p) => p.id === idProducto);
  if (!producto) return;

  const stockValido = Math.max(0, parseInt(nuevoStock, 10) || 0);

  try {
    const respuesta = await fetch(URL_PRODUCTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        stock: stockValido
      })
    });

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    producto.stock = stockValido;
    renderizarCatalogo(listaProductos);
    renderizarTablaAdmin(listaProductos);
    mostrarNotificacion(`Stock de "${producto.nombre}" actualizado a ${stockValido} unidades`, 'exito');
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    mostrarNotificacion('No se pudo actualizar el stock en la base de datos', 'error');
  }
}

async function reabastecerTodoElStock(unidades) {
  if (listaProductos.length === 0) return;

  const botonReabastecer = document.getElementById('boton-reabastecer-todo');
  if (botonReabastecer) {
    botonReabastecer.disabled = true;
    botonReabastecer.textContent = 'Actualizando inventario...';
  }

  let actualizados = 0;
  for (const producto of listaProductos) {
    const nuevoStock = producto.stock + unidades;
    try {
      await fetch(URL_PRODUCTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          stock: nuevoStock
        })
      });
      producto.stock = nuevoStock;
      actualizados++;
    } catch (error) {
      console.error(`Error al reabastecer ${producto.nombre}:`, error);
    }
  }

  renderizarCatalogo(listaProductos);
  renderizarTablaAdmin(listaProductos);
  mostrarNotificacion(`Se reabastecieron ${actualizados} peluches con +${unidades} unidades cada uno`, 'exito');

  if (botonReabastecer) {
    botonReabastecer.disabled = false;
    botonReabastecer.textContent = 'Reabastecer Todo (+10 uds)';
  }
}

async function crearNuevoPeluche(evento) {
  evento.preventDefault();

  const campoNombre = document.getElementById('nombre-nuevo-peluche');
  const campoPrecio = document.getElementById('precio-nuevo-peluche');
  const campoStock = document.getElementById('stock-nuevo-peluche');

  const nombre = campoNombre ? campoNombre.value.trim() : '';
  const precio = campoPrecio ? parseFloat(campoPrecio.value) : 0;
  const stock = campoStock ? parseInt(campoStock.value, 10) : 0;

  if (!nombre || precio <= 0 || stock < 0) {
    mostrarNotificacion('Por favor completa todos los campos con valores validos', 'alerta');
    return;
  }

  const nuevoPeluche = {
    nombre: nombre,
    precio: precio,
    stock: stock
  };

  const botonGuardar = document.getElementById('boton-guardar-nuevo-peluche');
  if (botonGuardar) {
    botonGuardar.disabled = true;
    botonGuardar.textContent = 'Guardando...';
  }

  try {
    const respuesta = await fetch(URL_PRODUCTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPeluche)
    });

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const pelucheGuardado = await respuesta.json();
    listaProductos.push(pelucheGuardado);

    renderizarCatalogo(listaProductos);
    renderizarTablaAdmin(listaProductos);

    evento.target.reset();
    const cajaNuevoPeluche = document.getElementById('caja-nuevo-peluche');
    if (cajaNuevoPeluche) cajaNuevoPeluche.style.display = 'none';

    mostrarNotificacion(`"${pelucheGuardado.nombre}" agregado al catalogo exitosamente!`, 'exito');
  } catch (error) {
    console.error('Error al crear peluche:', error);
    mostrarNotificacion('Error al guardar el nuevo peluche en la base de datos', 'error');
  } finally {
    if (botonGuardar) {
      botonGuardar.disabled = false;
      botonGuardar.textContent = 'Guardar en Base de Datos';
    }
  }
}
