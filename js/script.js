document.getElementById('formulario-gastos').addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const titulo = document.getElementById('titulo').value;
    const cantidad = document.getElementById('cantidad').value;
    const fecha = document.getElementById('fecha').value;

    if (!validarFormulario(usuario, titulo, cantidad, fecha)) {
        return;
    }

    const gasto = { usuario, titulo, cantidad: parseFloat(cantidad), fecha };
    agregarGasto(gasto);
    actualizarBalances();
    calcularDeudas();
    limpiarFormulario();
});

const gastos = [];
let balances = {};
const usuarios = new Set(); /* aqui he declarado un nuevo Set para almacenar
                            **  los usuarios porque no se pueden repetir */

// agregar un gasto
function agregarGasto(gasto) {
    gastos.push(gasto);
    usuarios.add(gasto.usuario);
    const listaGastos = document.getElementById('lista-gastos');
    const div = document.createElement('div');
    div.className = 'item-gasto';
    div.innerHTML = `
        <img src="../img/${gasto.usuario.toLowerCase()}.png" alt="${gasto.usuario}" class="imagen-usuario">
        <span>${gasto.usuario} pagó ${gasto.cantidad.toFixed(2)}€ el ${gasto.fecha}</span>
    `;
    listaGastos.appendChild(div);
}

// actualizar los balances
function actualizarBalances() {
    balances = {};
    gastos.forEach(gasto => {
        if (!balances[gasto.usuario]) balances[gasto.usuario] = 0;
        balances[gasto.usuario] += gasto.cantidad;
    });

    const listaBalances = document.getElementById('lista-balances');
    listaBalances.innerHTML = '';
    for (const [persona, balance] of Object.entries(balances)) {
        const div = document.createElement('div');
        div.className = 'item-balance';
        div.innerHTML = `
            <img src="../img/${persona.toLowerCase()}.png" alt="${persona}" class="imagen-usuario">
            <span>${persona}: ${balance.toFixed(2)}€</span>
        `;
        listaBalances.appendChild(div);
    }
}

// calcular las deudas
function calcularDeudas() {
    const totalGasto = gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
    const promedioGasto = totalGasto / usuarios.size;

    const deudas = [];
    const usuariosDeudas = [];
    const usuariosDeben = [];
    
    for (const [usuario, balance] of Object.entries(balances)) {
        const diferencia = balance - promedioGasto;
        if (diferencia > 0) {
            usuariosDeben.push({ usuario, cantidad: diferencia });
        } else if (diferencia < 0) {
            usuariosDeudas.push({ usuario, cantidad: -diferencia });
        }
    }

    usuariosDeben.forEach(acreedor => {
        while (acreedor.cantidad > 0 && usuariosDeudas.length > 0) {
            const deudor = usuariosDeudas[0];
            const deuda = Math.min(acreedor.cantidad, deudor.cantidad);

            deudas.push(`${deudor.usuario} debe ${deuda.toFixed(2)}€ a ${acreedor.usuario}`);

            acreedor.cantidad -= deuda;
            deudor.cantidad -= deuda;

            if (deudor.cantidad === 0) {
                usuariosDeudas.shift();
            }
        }
    });

    const listaDeudas = document.getElementById('lista-deudas');
    listaDeudas.innerHTML = '';
    deudas.forEach(deuda => {
        const div = document.createElement('div');
        div.className = 'item-deuda';
        div.textContent = deuda;
        listaDeudas.appendChild(div);
    });
}

// validar el formulario
function validarFormulario(usuario, titulo, cantidad, fecha) {
    let esValido = true;

    // validar usuario
    if (!usuario) {
        mostrarMensajeError('usuario', 'Por favor, selecciona un usuario.');
        esValido = false;
    } else {
        limpiarMensajeError('usuario');
    }

    // validar titulo
    if (!/^[a-zA-Z0-9]{1,20}$/.test(titulo)) {
        mostrarMensajeError('titulo', 'El título debe tener entre 1 y 20 caracteres alfanuméricos.');
        esValido = false;
    } else {
        limpiarMensajeError('titulo');
    }

    // validar cantidad
    if (!/^\d{1,3}\.\d{2}$/.test(cantidad) || parseFloat(cantidad) < 0 || parseFloat(cantidad) > 1000) {
        mostrarMensajeError('cantidad', 'La cantidad debe estar entre 0 y 1000 y con formato de dos decimales (ej. 10.00).');
        esValido = false;
    } else {
        limpiarMensajeError('cantidad');
    }

    // validar fecha
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha) || !esFechaValida(fecha)) {
        mostrarMensajeError('fecha', 'La fecha debe estar en el formato dd/mm/aaaa y ser válida.');
        esValido = false;
    } else {
        limpiarMensajeError('fecha');
    }

    return esValido;
}

// mostrar mensaje de error
function mostrarMensajeError(id, mensaje) {
    const campo = document.getElementById(id);
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    const mensajeError = campo.nextElementSibling;
    if (mensajeError && mensajeError.classList.contains('mensaje-error')) {
        mensajeError.textContent = mensaje;
    }
}

// limpiar mensaje de error
function limpiarMensajeError(id) {
    const campo = document.getElementById(id);
    campo.classList.add('is-valid');
    campo.classList.remove('is-invalid');
    const mensajeError = campo.nextElementSibling; /* el nextElementSibling sirve 
                                                   ** para seleccionar el siguiente elemento */
    if (mensajeError && mensajeError.classList.contains('mensaje-error')) {
        mensajeError.textContent = '';
    }
}

// limpiar el formulario
function limpiarFormulario() {
    document.getElementById('formulario-gastos').reset();
    ['usuario', 'titulo', 'cantidad', 'fecha'].forEach(id => {
        document.getElementById(id).classList.remove('is-valid', 'is-invalid');
        limpiarMensajeError(id);
    });
}

// verificar la fecha
function esFechaValida(fecha) {
    const [dia, mes, anio] = fecha.split('/').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    return fechaObj && fechaObj.getDate() === dia && fechaObj.getMonth() === mes - 1 && fechaObj.getFullYear() === anio;
}
