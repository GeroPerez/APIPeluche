const URL_PRODUCTOS = '/api/producto';
const URL_CLIENTES = '/api/clientes';
const URL_COMPRA = '/api/compra';
const URL_FACTURA = '/api/factura';

const CLAVE_SESION_USUARIO = 'pelucheria_sesion_usuario';
const CLAVE_HISTORIAL_FACTURAS_LIMPIAS = 'pelucheria_facturas_limpias';

let listaProductos = [];
let listaClientes = [];
let listaFacturas = [];
let carrito = [];

let indiceCarruselActual = 0;
let listaDestacados = [];
let temporizadorCarrusel = null;

let usuarioActual = null;
let esModoAdministrador = false;

document.addEventListener('DOMContentLoaded', () => {
  inicializarAplicacion();
});

function inicializarAplicacion() {
  configurarEventos();
  restaurarSesion();
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

  const formularioLogin = document.getElementById('formulario-login');
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', procesarInicioSesion);
  }

  const botonCerrarSesion = document.getElementById('boton-cerrar-sesion');
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener('click', cerrarSesion);
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
    campoBusqueda.addEventListener('input', () => {
      aplicarFiltrosYOrden();
    });
  }

  const selectorOrden = document.getElementById('selector-orden-precio');
  if (selectorOrden) {
    selectorOrden.addEventListener('change', () => {
      aplicarFiltrosYOrden();
    });
  }

  const selectorRango = document.getElementById('selector-rango-precio');
  if (selectorRango) {
    selectorRango.addEventListener('change', () => {
      aplicarFiltrosYOrden();
    });
  }

  const botonLimpiarFiltros = document.getElementById('boton-limpiar-filtros');
  if (botonLimpiarFiltros) {
    botonLimpiarFiltros.addEventListener('click', () => {
      limpiarFiltrosCatalogo();
    });
  }

  const botonCarruselAnterior = document.getElementById('boton-carrusel-anterior');
  if (botonCarruselAnterior) {
    botonCarruselAnterior.addEventListener('click', () => {
      moverCarrusel(-1);
    });
  }

  const botonCarruselSiguiente = document.getElementById('boton-carrusel-siguiente');
  if (botonCarruselSiguiente) {
    botonCarruselSiguiente.addEventListener('click', () => {
      moverCarrusel(1);
    });
  }

  const botonReintentar = document.getElementById('boton-reintentar-catalogo');
  if (botonReintentar) {
    botonReintentar.addEventListener('click', () => {
      obtenerProductos();
      cargarClientes();
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

  const botonAdminVerFacturas = document.getElementById('boton-admin-ver-facturas');
  if (botonAdminVerFacturas && modalHistorial) {
    botonAdminVerFacturas.addEventListener('click', () => {
      obtenerFacturas();
      abrirModal(modalHistorial);
    });
  }

  const botonAdminLimpiarFacturas = document.getElementById('boton-admin-limpiar-facturas');
  if (botonAdminLimpiarFacturas) {
    botonAdminLimpiarFacturas.addEventListener('click', limpiarHistorialFacturas);
  }
}

function restaurarSesion() {
  try {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION_USUARIO);
    if (sesionGuardada) {
      const usuario = JSON.parse(sesionGuardada);
      if (usuario && usuario.correo) {
        establecerSesion(usuario, false);
        return;
      }
    }
  } catch (error) {
    console.warn('Error al restaurar sesion previa:', error);
  }
  establecerModoInvitado();
}

function establecerSesion(usuario, mostrarMensaje = true) {
  usuarioActual = usuario;
  const correoNormalizado = (usuario.correo || '').trim().toLowerCase();
  esModoAdministrador = correoNormalizado === 'admin@peluche.com' || (usuario.cuit && usuario.cuit === '00-00000000-0');

  try {
    localStorage.setItem(CLAVE_SESION_USUARIO, JSON.stringify(usuario));
  } catch (error) {
    console.warn('No se pudo guardar la sesion en almacenamiento local:', error);
  }

  actualizarInterfazSegunRol();

  if (mostrarMensaje) {
    if (esModoAdministrador) {
      mostrarNotificacion('Bienvenido Administrador al panel de control', 'exito');
    } else {
      mostrarNotificacion(`Bienvenido, ${usuario.nombre} ${usuario.apellido}`, 'exito');
    }
  }
}

function establecerModoInvitado() {
  usuarioActual = null;
  esModoAdministrador = false;
  localStorage.removeItem(CLAVE_SESION_USUARIO);
  actualizarInterfazSegunRol();
}

function cerrarSesion() {
  establecerModoInvitado();
  carrito = [];
  actualizarCarrito();
  mostrarNotificacion('Has cerrado sesion correctamente', 'exito');
}

function actualizarInterfazSegunRol() {
  const navItemCatalogo = document.getElementById('nav-item-catalogo');
  const navItemLogin = document.getElementById('nav-item-login');
  const navItemRegistro = document.getElementById('nav-item-registro');
  const navItemFacturas = document.getElementById('nav-item-facturas');
  const navItemCarrito = document.getElementById('nav-item-carrito');
  const navItemUsuario = document.getElementById('nav-item-usuario');
  const textoUsuarioNav = document.getElementById('texto-usuario-nav');

  const seccionPortada = document.getElementById('portada-destacada');
  const seccionCarrusel = document.getElementById('seccion-carrusel');
  const seccionBarraEstado = document.getElementById('seccion-barra-estado');
  const seccionAutenticacion = document.getElementById('seccion-autenticacion');
  const seccionCatalogo = document.getElementById('seccion-catalogo');
  const seccionRegistro = document.getElementById('seccion-registro');
  const seccionPanelAdmin = document.getElementById('seccion-panel-admin');

  const etiquetaSesionActiva = document.getElementById('etiqueta-sesion-activa');
  const avatarSesion = document.getElementById('avatar-sesion');
  const accionesBarraEstado = document.getElementById('acciones-barra-estado');
  const clienteResumenCompra = document.getElementById('cliente-resumen-compra');
  const avisoInvitadoCarrito = document.getElementById('aviso-invitado-carrito');
  const botonProcesar = document.getElementById('boton-procesar-compra');

  if (esModoAdministrador) {
    if (navItemCatalogo) navItemCatalogo.style.display = 'none';
    if (navItemLogin) navItemLogin.style.display = 'none';
    if (navItemRegistro) navItemRegistro.style.display = 'none';
    if (navItemFacturas) navItemFacturas.style.display = 'none';
    if (navItemCarrito) navItemCarrito.style.display = 'none';
    if (navItemUsuario) navItemUsuario.style.display = 'block';
    if (textoUsuarioNav) textoUsuarioNav.textContent = 'Admin Oficial';

    if (seccionPortada) seccionPortada.style.display = 'none';
    if (seccionCarrusel) seccionCarrusel.style.display = 'none';
    if (seccionAutenticacion) seccionAutenticacion.style.display = 'none';
    if (seccionCatalogo) seccionCatalogo.style.display = 'none';
    if (seccionRegistro) seccionRegistro.style.display = 'none';
    if (seccionPanelAdmin) seccionPanelAdmin.style.display = 'block';

    if (seccionBarraEstado) seccionBarraEstado.style.display = 'block';
    if (etiquetaSesionActiva) etiquetaSesionActiva.textContent = 'Sesion Administrador Oficial';
    if (avatarSesion) avatarSesion.textContent = '⚙️';
    if (accionesBarraEstado) {
      accionesBarraEstado.innerHTML = `
        <button class="boton-accion-secundaria" id="boton-estado-cerrar-sesion" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
          Cerrar Sesion
        </button>
      `;
      const botonEstadoCerrar = document.getElementById('boton-estado-cerrar-sesion');
      if (botonEstadoCerrar) {
        botonEstadoCerrar.addEventListener('click', cerrarSesion);
      }
    }

    actualizarMetricasAdmin();
    renderizarTablaAdmin(listaProductos);

  } else if (usuarioActual) {
    if (navItemCatalogo) navItemCatalogo.style.display = 'block';
    if (navItemLogin) navItemLogin.style.display = 'none';
    if (navItemRegistro) navItemRegistro.style.display = 'none';
    if (navItemFacturas) navItemFacturas.style.display = 'block';
    if (navItemCarrito) navItemCarrito.style.display = 'block';
    if (navItemUsuario) navItemUsuario.style.display = 'block';
    if (textoUsuarioNav) textoUsuarioNav.textContent = `${usuarioActual.nombre}`;

    if (seccionPortada) seccionPortada.style.display = 'block';
    if (seccionCarrusel) seccionCarrusel.style.display = 'block';
    if (seccionAutenticacion) seccionAutenticacion.style.display = 'none';
    if (seccionCatalogo) seccionCatalogo.style.display = 'block';
    if (seccionRegistro) seccionRegistro.style.display = 'none';
    if (seccionPanelAdmin) seccionPanelAdmin.style.display = 'none';

    if (seccionBarraEstado) seccionBarraEstado.style.display = 'block';
    if (etiquetaSesionActiva) etiquetaSesionActiva.textContent = `${usuarioActual.nombre} ${usuarioActual.apellido} (${usuarioActual.correo})`;
    if (avatarSesion) avatarSesion.textContent = '👤';
    if (accionesBarraEstado) {
      accionesBarraEstado.innerHTML = `
        <button class="boton-accion-secundaria" id="boton-estado-cerrar-sesion" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
          Cerrar Sesion
        </button>
      `;
      const botonEstadoCerrar = document.getElementById('boton-estado-cerrar-sesion');
      if (botonEstadoCerrar) {
        botonEstadoCerrar.addEventListener('click', cerrarSesion);
      }
    }

    if (clienteResumenCompra) {
      clienteResumenCompra.textContent = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
      clienteResumenCompra.style.color = '#00876c';
    }
    if (avisoInvitadoCarrito) avisoInvitadoCarrito.style.display = 'none';
    if (botonProcesar) botonProcesar.disabled = carrito.length === 0;

  } else {
    if (navItemCatalogo) navItemCatalogo.style.display = 'block';
    if (navItemLogin) navItemLogin.style.display = 'block';
    if (navItemRegistro) navItemRegistro.style.display = 'block';
    if (navItemFacturas) navItemFacturas.style.display = 'none';
    if (navItemCarrito) navItemCarrito.style.display = 'block';
    if (navItemUsuario) navItemUsuario.style.display = 'none';

    if (seccionPortada) seccionPortada.style.display = 'block';
    if (seccionCarrusel) seccionCarrusel.style.display = 'block';
    if (seccionAutenticacion) seccionAutenticacion.style.display = 'block';
    if (seccionCatalogo) seccionCatalogo.style.display = 'block';
    if (seccionRegistro) seccionRegistro.style.display = 'block';
    if (seccionPanelAdmin) seccionPanelAdmin.style.display = 'none';

    if (seccionBarraEstado) seccionBarraEstado.style.display = 'block';
    if (etiquetaSesionActiva) etiquetaSesionActiva.textContent = 'Navegando como Invitado (Modo lectura)';
    if (avatarSesion) avatarSesion.textContent = '👀';
    if (accionesBarraEstado) {
      accionesBarraEstado.innerHTML = `
        <a href="#seccion-autenticacion" class="boton-accion-estado">Iniciar Sesion</a>
      `;
    }

    if (clienteResumenCompra) {
      clienteResumenCompra.textContent = 'Invitado (Requiere iniciar sesion)';
      clienteResumenCompra.style.color = '#d63031';
    }
    if (avisoInvitadoCarrito) avisoInvitadoCarrito.style.display = 'block';
    if (botonProcesar) botonProcesar.disabled = true;
  }
}

async function cargarClientes() {
  try {
    const respuesta = await fetch(URL_CLIENTES);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const clientes = await respuesta.json();
    if (Array.isArray(clientes)) {
      listaClientes = clientes;
    }
  } catch (error) {
    console.warn('No se pudo actualizar clientes desde la API:', error);
  }
}

async function procesarInicioSesion(evento) {
  evento.preventDefault();

  const campoCorreo = document.getElementById('correo-login');
  const campoContrasena = document.getElementById('contrasena-login');

  const correoIngresado = (campoCorreo ? campoCorreo.value : '').trim().toLowerCase();
  const contrasenaIngresada = (campoContrasena ? campoContrasena.value : '').trim();

  if (!correoIngresado || !contrasenaIngresada) {
    mostrarNotificacion('Por favor completa todos los campos de inicio de sesion', 'alerta');
    return;
  }

  await cargarClientes();

  const usuarioEncontrado = listaClientes.find((c) => {
    const correoCliente = (c.correo || '').trim().toLowerCase();
    const contrasenaCliente = (c.contrasena || '').trim();
    return correoCliente === correoIngresado && contrasenaCliente === contrasenaIngresada;
  });

  if (!usuarioEncontrado) {
    mostrarNotificacion('Credenciales invalidas. Revisa tu correo y contrasena.', 'error');
    return;
  }

  establecerSesion(usuarioEncontrado, true);
  evento.target.reset();
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

    evento.target.reset();
    mostrarNotificacion('Registro exitoso! Iniciando sesion...', 'exito');
    establecerSesion(clienteGuardado, true);
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
    aplicarFiltrosYOrden();
    configurarCarruselDestacados();
    if (esModoAdministrador) {
      renderizarTablaAdmin(listaProductos);
      actualizarMetricasAdmin();
    }
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
      <div class="caja-sin-coincidencias">
        <div class="icono-sin-coincidencias">🔍🧸</div>
        <h3 class="titulo-sin-coincidencias">¡Sin coincidencias encontradas!</h3>
        <p class="mensaje-sin-coincidencias">No encontramos ningún peluche que coincida con tus filtros o término de búsqueda.</p>
        <button class="boton-accion-secundaria" onclick="limpiarFiltrosCatalogo()">Restablecer Filtros</button>
      </div>
    `;
    return;
  }

  productos.forEach((producto) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';
    tarjeta.id = `tarjeta-producto-${producto.id}`;

    const urlImagen = obtenerImagenPeluche(producto);
    const hayStock = producto.stock > 0;
    const esPocoStock = hayStock && producto.stock < 10;

    let claseStock = 'stock-disponible';
    let textoStock = `${producto.stock} disponibles`;

    if (!hayStock) {
      claseStock = 'stock-agotado';
      textoStock = 'Agotado';
    } else if (esPocoStock) {
      claseStock = 'stock-critico';
      textoStock = `🔥 ¡Solo quedan ${producto.stock}!`;
    }

    tarjeta.innerHTML = `
      <div class="contenedor-imagen-tarjeta">
        <img src="${urlImagen}" alt="${producto.nombre}" class="imagen-producto-tarjeta" loading="lazy" onerror="this.src='images/Oso.webp'">
        <span class="insignia-stock ${claseStock}">${textoStock}</span>
      </div>
      <div class="cuerpo-tarjeta">
        <h3 class="titulo-producto">${producto.nombre}</h3>
        <p class="informacion-stock">Código: #${producto.id} | Stock: ${producto.stock}</p>
        <div class="pie-tarjeta">
          <span class="precio-producto">${formatearDinero(producto.precio)}</span>
          <button 
            class="boton-aniadir" 
            data-id="${producto.id}"
            ${!hayStock ? 'disabled' : ''}
          >
            <span>+</span>
            <span>${hayStock ? 'Añadir' : 'Agotado'}</span>
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

function aplicarFiltrosYOrden() {
  const campoBusqueda = document.getElementById('campo-busqueda');
  const selectorOrden = document.getElementById('selector-orden-precio');
  const selectorRango = document.getElementById('selector-rango-precio');

  const termino = normalizarTexto(campoBusqueda ? campoBusqueda.value.trim() : '');
  const tipoOrden = selectorOrden ? selectorOrden.value : 'defecto';
  const tipoRango = selectorRango ? selectorRango.value : 'todos';

  let productosFiltrados = listaProductos.filter((producto) => {
    const coincideTexto = !termino || normalizarTexto(producto.nombre).includes(termino);

    let coincideRango = true;
    const precio = parseFloat(producto.precio) || 0;

    if (tipoRango === '0-15000') {
      coincideRango = precio <= 15000;
    } else if (tipoRango === '15000-20000') {
      coincideRango = precio > 15000 && precio <= 20000;
    } else if (tipoRango === '20000-mas') {
      coincideRango = precio > 20000;
    }

    return coincideTexto && coincideRango;
  });

  if (tipoOrden === 'menor-mayor') {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (tipoOrden === 'mayor-menor') {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }

  renderizarCatalogo(productosFiltrados);
}

function limpiarFiltrosCatalogo() {
  const campoBusqueda = document.getElementById('campo-busqueda');
  const selectorOrden = document.getElementById('selector-orden-precio');
  const selectorRango = document.getElementById('selector-rango-precio');

  if (campoBusqueda) campoBusqueda.value = '';
  if (selectorOrden) selectorOrden.value = 'defecto';
  if (selectorRango) selectorRango.value = 'todos';

  aplicarFiltrosYOrden();
}

function configurarCarruselDestacados() {
  if (listaProductos.length === 0) return;

  const pista = document.getElementById('pista-carrusel');
  const indicadores = document.getElementById('indicadores-carrusel');
  if (!pista) return;

  listaDestacados = listaProductos.slice(0, 6);
  pista.innerHTML = '';
  if (indicadores) indicadores.innerHTML = '';

  listaDestacados.forEach((producto, indice) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-carrusel';

    const urlImagen = obtenerImagenPeluche(producto);
    const esPocoStock = producto.stock > 0 && producto.stock < 10;
    const textoStock = esPocoStock ? `¡Solo quedan ${producto.stock}!` : `${producto.stock} unidades`;

    tarjeta.innerHTML = `
      <span class="insignia-carrusel-estrella">⭐ Destacado</span>
      <div class="icono-carrusel">
        <img src="${urlImagen}" alt="${producto.nombre}" class="imagen-carrusel" loading="lazy" onerror="this.src='images/Oso.webp'">
      </div>
      <h3 class="nombre-carrusel">${producto.nombre}</h3>
      <p style="font-size: 0.85rem; color: #636e72; margin-bottom: 0.5rem;">${textoStock}</p>
      <div class="precio-carrusel">${formatearDinero(producto.precio)}</div>
      <button class="boton-ver-en-catalogo" data-id="${producto.id}">
        <span>🔍</span>
        <span>Ver en Catálogo</span>
      </button>
    `;

    const botonVer = tarjeta.querySelector('.boton-ver-en-catalogo');
    if (botonVer) {
      botonVer.addEventListener('click', () => {
        irACatalogoYDestacar(producto.id);
      });
    }

    pista.appendChild(tarjeta);

    if (indicadores) {
      const punto = document.createElement('div');
      punto.className = `punto-indicador ${indice === 0 ? 'activo' : ''}`;
      punto.addEventListener('click', () => {
        irAPosicionCarrusel(indice);
      });
      indicadores.appendChild(punto);
    }
  });

  iniciarRotacionAutomaticaCarrusel();
}

function moverCarrusel(direccion) {
  if (listaDestacados.length === 0) return;
  const maxIndice = Math.max(0, listaDestacados.length - 1);
  indiceCarruselActual += direccion;

  if (indiceCarruselActual < 0) {
    indiceCarruselActual = maxIndice;
  } else if (indiceCarruselActual > maxIndice) {
    indiceCarruselActual = 0;
  }

  actualizarDesplazamientoCarrusel();
}

function irAPosicionCarrusel(indice) {
  indiceCarruselActual = indice;
  actualizarDesplazamientoCarrusel();
}

function actualizarDesplazamientoCarrusel() {
  const pista = document.getElementById('pista-carrusel');
  const indicadores = document.getElementById('indicadores-carrusel');
  if (!pista) return;

  const tarjetas = pista.querySelectorAll('.tarjeta-carrusel');
  if (tarjetas.length === 0) return;

  const anchoTarjeta = tarjetas[0].offsetWidth + 24;
  pista.style.transform = `translateX(-${indiceCarruselActual * anchoTarjeta}px)`;

  if (indicadores) {
    const puntos = indicadores.querySelectorAll('.punto-indicador');
    puntos.forEach((p, idx) => {
      p.classList.toggle('activo', idx === indiceCarruselActual);
    });
  }
}

function iniciarRotacionAutomaticaCarrusel() {
  if (temporizadorCarrusel) clearInterval(temporizadorCarrusel);
  temporizadorCarrusel = setInterval(() => {
    moverCarrusel(1);
  }, 5000);
}

function irACatalogoYDestacar(idProducto) {
  limpiarFiltrosCatalogo();

  const seccionCatalogo = document.getElementById('seccion-catalogo');
  if (seccionCatalogo) {
    seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
  }

  setTimeout(() => {
    const tarjeta = document.getElementById(`tarjeta-producto-${idProducto}`);
    if (tarjeta) {
      tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tarjeta.classList.add('tarjeta-destacada-enfoque');
      setTimeout(() => {
        tarjeta.classList.remove('tarjeta-destacada-enfoque');
      }, 2500);
    }
  }, 450);
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
    mostrarNotificacion(`Stock máximo alcanzado para "${producto.nombre}"`, 'alerta');
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
  mostrarNotificacion(`"${producto.nombre}" añadido al carrito`, 'exito');
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
  const avisoInvitadoCarrito = document.getElementById('aviso-invitado-carrito');

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

  const puedeComprar = usuarioActual && !esModoAdministrador;
  if (botonProcesar) {
    botonProcesar.disabled = carrito.length === 0 || !puedeComprar;
  }

  if (avisoInvitadoCarrito) {
    avisoInvitadoCarrito.style.display = puedeComprar ? 'none' : 'block';
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

async function procesarCompra() {
  if (carrito.length === 0) {
    mostrarNotificacion('El carrito esta vacio', 'alerta');
    return;
  }

  if (!usuarioActual || esModoAdministrador) {
    mostrarNotificacion('Debes iniciar sesion como cliente para procesar la compra', 'alerta');
    const modalCarrito = document.getElementById('modal-carrito');
    if (modalCarrito) cerrarModal(modalCarrito);
    window.location.hash = '#seccion-autenticacion';
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

  const nombreCompletoCliente = `${usuarioActual.nombre} ${usuarioActual.apellido}`;

  const datosCompra = {
    iva: 21,
    subtotal: subtotalRedondeado,
    total: totalRedondeado,
    cliente: {
      id: usuarioActual.id,
      nombre: usuarioActual.nombre,
      apellido: usuarioActual.apellido,
      correo: usuarioActual.correo,
      direccion: usuarioActual.direccion,
      cuit: usuarioActual.cuit
    },
    factura: {
      nomcli: nombreCompletoCliente,
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
      <p><strong>Cliente:</strong> ${usuarioActual.nombre} ${usuarioActual.apellido}</p>
      <p><strong>CUIT:</strong> ${usuarioActual.cuit}</p>
      <p><strong>Direccion:</strong> ${usuarioActual.direccion}</p>
      <p><strong>Correo:</strong> ${usuarioActual.correo}</p>
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
  const tituloModal = document.getElementById('titulo-modal-historial');
  if (!listaHistorial) return;

  if (tituloModal) {
    tituloModal.textContent = esModoAdministrador
      ? 'Historial Global de Facturas (Administrador)'
      : `Mis Facturas - ${usuarioActual ? usuarioActual.nombre : ''}`;
  }

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
    listaFacturas = Array.isArray(facturas) ? facturas : [];

    const idsOcultos = obtenerIdsFacturasOcultas();
    let facturasVisibles = listaFacturas.filter((f) => !idsOcultos.includes(f.id));

    if (!esModoAdministrador && usuarioActual) {
      const nombreUsuario = normalizarTexto(`${usuarioActual.nombre} ${usuarioActual.apellido}`);
      facturasVisibles = facturasVisibles.filter((f) => {
        const nombreFactura = normalizarTexto(f.nomcli || '');
        return nombreFactura.includes(normalizarTexto(usuarioActual.nombre)) ||
               nombreFactura === nombreUsuario;
      });
    }

    if (facturasVisibles.length === 0) {
      listaHistorial.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #636e72;">
          ${esModoAdministrador ? 'No hay facturas emitidas registradas en el sistema.' : 'No tienes facturas emitidas registradas a tu nombre.'}
        </div>
      `;
      return;
    }

    listaHistorial.innerHTML = '';
    facturasVisibles.forEach((factura) => {
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

    if (esModoAdministrador) {
      actualizarMetricasAdmin();
    }
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    listaHistorial.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #d63031;">
        No se pudieron cargar las facturas. Asegúrate de que el servidor esté en línea.
      </div>
    `;
  }
}

function obtenerIdsFacturasOcultas() {
  try {
    const raw = localStorage.getItem(CLAVE_HISTORIAL_FACTURAS_LIMPIAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error al leer historial de facturas limpias:', e);
  }
  return [];
}

function limpiarHistorialFacturas() {
  const confirmacion = confirm('¿Confirmas que deseas limpiar y reiniciar el historial de facturas visualizadas en la tienda?');
  if (!confirmacion) return;

  const todosLosIds = listaFacturas.map((f) => f.id);
  localStorage.setItem(CLAVE_HISTORIAL_FACTURAS_LIMPIAS, JSON.stringify(todosLosIds));

  mostrarNotificacion('El historial de facturas ha sido limpiado exitosamente', 'exito');
  actualizarMetricasAdmin();
}

function actualizarMetricasAdmin() {
  const metricaPeluches = document.getElementById('metrica-total-peluches');
  const metricaStock = document.getElementById('metrica-total-stock');
  const metricaFacturas = document.getElementById('metrica-total-facturas');

  if (metricaPeluches) {
    metricaPeluches.textContent = listaProductos.length;
  }

  if (metricaStock) {
    const stockTotal = listaProductos.reduce((acc, p) => acc + (parseInt(p.stock, 10) || 0), 0);
    metricaStock.textContent = stockTotal;
  }

  if (metricaFacturas) {
    const idsOcultos = obtenerIdsFacturasOcultas();
    const facturasVisibles = listaFacturas.filter((f) => !idsOcultos.includes(f.id));
    metricaFacturas.textContent = facturasVisibles.length;
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

function normalizarRutaImagen(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  const limpia = url.trim();
  if (limpia.startsWith('http://') || limpia.startsWith('https://') || limpia.startsWith('/') || limpia.startsWith('images/')) {
    return limpia;
  }
  return `images/${limpia}`;
}

function obtenerImagenPeluche(producto) {
  const rutaPropiedad = producto ? (producto.imagenUrl || producto.url) : null;
  if (rutaPropiedad) {
    const rutaNormalizada = normalizarRutaImagen(rutaPropiedad);
    if (rutaNormalizada) return rutaNormalizada;
  }

  const nombre = producto && producto.nombre ? producto.nombre : '';
  const texto = normalizarTexto(nombre);

  if (texto.includes('panda')) return 'images/Panda.webp';
  if (texto.includes('gato')) return 'images/Gato.webp';
  if (texto.includes('chancho') || texto.includes('cerdito')) return 'images/Chancho.webp';
  if (texto.includes('pinguino')) return 'images/Pinguino.webp';
  if (texto.includes('elefante')) return 'images/Elefante.webp';
  if (texto.includes('foca')) return 'images/Foca.webp';
  if (texto.includes('perro') || texto.includes('perrito')) return 'images/Perro.webp';
  if (texto.includes('pug')) return 'images/Pug.webp';
  if (texto.includes('tigre')) return 'images/Tigre.webp';
  if (texto.includes('pez')) return 'images/Pez.webp';
  if (texto.includes('cocodrilo')) return 'images/Cocodrilo.webp';
  if (texto.includes('dragonite')) return 'images/Dragonite.webp';
  if (texto.includes('garfield')) return 'images/Garfield.webp';
  if (texto.includes('godzilla')) return 'images/Godzilla.webp';
  if (texto.includes('kirby')) return 'images/Kirby.webp';
  if (texto.includes('marill')) return 'images/Marill.webp';
  if (texto.includes('pikachu')) return 'images/Pikachu.webp';
  if (texto.includes('snorlax')) return 'images/Snorlax.webp';
  if (texto.includes('oso')) return 'images/Oso.webp';

  return 'images/Oso.webp';
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
  renderizarTablaAdmin(listaProductos);
  actualizarMetricasAdmin();
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
    const urlImagen = obtenerImagenPeluche(p);
    const hayStock = p.stock > 0;
    const claseStock = hayStock ? 'stock-disponible' : 'stock-agotado';

    fila.innerHTML = `
      <td><strong>#${p.id}</strong></td>
      <td>
        <span class="celda-producto-admin">
          <img src="${urlImagen}" alt="${p.nombre}" class="miniatura-tabla-admin" onerror="this.src='images/Oso.webp'">
          <strong>${p.nombre}</strong>
        </span>
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
    actualizarMetricasAdmin();
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
  actualizarMetricasAdmin();
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
  const campoUrl = document.getElementById('url-nuevo-peluche');

  const nombre = campoNombre ? campoNombre.value.trim() : '';
  const precio = campoPrecio ? parseFloat(campoPrecio.value) : 0;
  const stock = campoStock ? parseInt(campoStock.value, 10) : 0;
  const url = campoUrl ? campoUrl.value.trim() : '';

  if (!nombre || precio <= 0 || stock < 0) {
    mostrarNotificacion('Por favor completa todos los campos con valores validos', 'alerta');
    return;
  }

  const nuevoPeluche = {
    nombre: nombre,
    precio: precio,
    stock: stock,
    imagenUrl: url,
    url: url
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
    actualizarMetricasAdmin();

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
