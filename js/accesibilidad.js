// js/accesibilidad.js - Sistema de Accesibilidad Global

let configActual = {
    texto: 'medio',      // pequeño, medio, grande, extra
    contraste: 'normal', // normal, alto
    sonidos: true,       // true=activado, false=silenciado
    tiempo: 'normal',    // normal, masTiempo
    modoConcentracion: false,
    ayudas: false
};

// Función que aplica TODAS las configuraciones a la página
function aplicarConfiguracion() {
    // 1. Aplicar tamaño de texto
    const tamanios = {
        'pequeno': '14px',
        'medio': '16px',
        'grande': '20px',
        'extra': '24px'
    };
    
    if (tamanios[configActual.texto]) {
        document.documentElement.style.fontSize = tamanios[configActual.texto];
    }
    
    // 2. Aplicar contraste
    document.body.classList.remove('alto-contraste');
    if (configActual.contraste === 'alto') {
        document.body.classList.add('alto-contraste');
    }
    
    // 3. Aplicar modo concentración (ocultar elementos decorativos)
    document.body.classList.remove('modo-concentracion');
    if (configActual.modoConcentracion) {
        document.body.classList.add('modo-concentracion');
    }
    
    // 4. Aplicar visibilidad de ayudas
    document.body.classList.remove('ayudas-visibles');
    if (configActual.ayudas) {
        document.body.classList.add('ayudas-visibles');
    }
    
    // 5. Actualizar estado visual de los botones en el panel
    actualizarBotonesPanel();
    
    // 6. Guardar en localStorage
    localStorage.setItem('accesibilidadConfig', JSON.stringify(configActual));
    
    // 7. Anunciar cambio para lectores de pantalla
    const anuncio = document.getElementById('anuncio-accesibilidad');
    if (anuncio) {
        let cambios = [];
        cambios.push(`Texto: ${configActual.texto}`);
        cambios.push(`Contraste: ${configActual.contraste}`);
        if (configActual.modoConcentracion) cambios.push('Modo concentración activado');
        if (configActual.ayudas) cambios.push('Ayudas visuales activadas');
        anuncio.textContent = `Configuración aplicada: ${cambios.join(', ')}`;
    }
}

// Función que actualiza la apariencia de los botones según la configuración actual
function actualizarBotonesPanel() {
    // Tamaño de texto
    document.querySelectorAll('[data-texto]').forEach(btn => {
        btn.classList.remove('activo');
        if (btn.dataset.texto === configActual.texto) {
            btn.classList.add('activo');
        }
    });
    
    // Contraste
    document.querySelectorAll('[data-contraste]').forEach(btn => {
        btn.classList.remove('activo');
        if (btn.dataset.contraste === configActual.contraste) {
            btn.classList.add('activo');
        }
    });
    
    // Sonidos
    document.querySelectorAll('[data-sonidos]').forEach(btn => {
        btn.classList.remove('activo');
        if ((btn.dataset.sonidos === 'activar' && configActual.sonidos) ||
            (btn.dataset.sonidos === 'silenciar' && !configActual.sonidos)) {
            btn.classList.add('activo');
        }
    });
    
    // Tiempo
    document.querySelectorAll('[data-tiempo]').forEach(btn => {
        btn.classList.remove('activo');
        const valor = btn.dataset.tiempo === 'mas' ? 'masTiempo' : btn.dataset.tiempo;
        if (valor === configActual.tiempo) {
            btn.classList.add('activo');
        }
    });
    
    // Modo concentración
    const btnModo = document.querySelector('[data-modo="concentracion"]');
    if (btnModo) {
        btnModo.classList.toggle('activo', configActual.modoConcentracion);
    }
    
    // Ayudas
    const btnAyudas = document.querySelector('[data-ayudas="mostrar"]');
    if (btnAyudas) {
        btnAyudas.classList.toggle('activo', configActual.ayudas);
    }
}

// ============================================
// PERFILES RÁPIDOS
// ============================================

function aplicarPerfilTDA() {
    configActual.texto = 'medio';
    configActual.contraste = 'normal';
    configActual.sonidos = true;
    configActual.tiempo = 'masTiempo';
    configActual.modoConcentracion = true;
    configActual.ayudas = false;
    aplicarConfiguracion();
    mostrarMensajePerfil('🧠 Perfil TDA: Más tiempo + Modo concentración');
}

function aplicarPerfilAutismo() {
    configActual.texto = 'medio';
    configActual.contraste = 'normal';
    configActual.sonidos = false;
    configActual.tiempo = 'normal';
    configActual.modoConcentracion = true;
    configActual.ayudas = true;
    aplicarConfiguracion();
    mostrarMensajePerfil('🟡 Perfil Autismo: Sin sonidos + Modo concentración + Ayudas');
}

function aplicarPerfilDown() {
    configActual.texto = 'grande';
    configActual.contraste = 'alto';
    configActual.sonidos = false;
    configActual.tiempo = 'masTiempo';
    configActual.modoConcentracion = false;
    configActual.ayudas = true;
    aplicarConfiguracion();
    mostrarMensajePerfil('🟦 Perfil Down: Texto grande + Alto contraste + Ayudas');
}

function aplicarPerfilRetraso() {
    configActual.texto = 'grande';
    configActual.contraste = 'normal';
    configActual.sonidos = true;
    configActual.tiempo = 'masTiempo';
    configActual.modoConcentracion = false;
    configActual.ayudas = true;
    aplicarConfiguracion();
    mostrarMensajePerfil('🟢 Perfil Retraso: Texto grande + Más tiempo + Ayudas');
}

function mostrarMensajePerfil(mensaje) {
    const anuncio = document.getElementById('anuncio-accesibilidad');
    if (anuncio) {
        anuncio.textContent = mensaje;
        setTimeout(() => {
            if (anuncio.textContent === mensaje) {
                anuncio.textContent = '';
            }
        }, 4000);
    }
}

// ============================================
// CARGAR Y GUARDAR CONFIGURACIÓN
// ============================================

function cargarConfiguracionGuardada() {
    const guardada = localStorage.getItem('accesibilidadConfig');
    if (guardada) {
        try {
            const config = JSON.parse(guardada);
            configActual = { ...configActual, ...config };
            aplicarConfiguracion();
        } catch(e) {
            console.log('Error cargando configuración:', e);
        }
    }
}

// ============================================
// OBTENER CONFIGURACIÓN GLOBAL
// ============================================

function obtenerConfig() {
    return configActual;
}

function obtenerTiempoEspera() {
    return configActual.tiempo === 'masTiempo' ? 8000 : 3000;
}

function estanSolidosActivados() {
    return configActual.sonidos === true;
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracionGuardada();
    
    // Conectar botones de perfil
    const btnTDA = document.querySelector('[data-perfil="tda"]');
    if (btnTDA) btnTDA.addEventListener('click', aplicarPerfilTDA);
    
    const btnAutismo = document.querySelector('[data-perfil="autismo"]');
    if (btnAutismo) btnAutismo.addEventListener('click', aplicarPerfilAutismo);
    
    const btnDown = document.querySelector('[data-perfil="down"]');
    if (btnDown) btnDown.addEventListener('click', aplicarPerfilDown);
    
    const btnRetraso = document.querySelector('[data-perfil="retraso"]');
    if (btnRetraso) btnRetraso.addEventListener('click', aplicarPerfilRetraso);
    
    // Conectar botones individuales de configuración
    
    // Texto
    document.querySelectorAll('[data-texto]').forEach(btn => {
        btn.addEventListener('click', () => {
            configActual.texto = btn.dataset.texto;
            aplicarConfiguracion();
        });
    });
    
    // Contraste
    document.querySelectorAll('[data-contraste]').forEach(btn => {
        btn.addEventListener('click', () => {
            configActual.contraste = btn.dataset.contraste;
            aplicarConfiguracion();
        });
    });
    
    // Sonidos
    document.querySelectorAll('[data-sonidos]').forEach(btn => {
        btn.addEventListener('click', () => {
            configActual.sonidos = btn.dataset.sonidos === 'activar';
            aplicarConfiguracion();
        });
    });
    
    // Tiempo
    document.querySelectorAll('[data-tiempo]').forEach(btn => {
        btn.addEventListener('click', () => {
            configActual.tiempo = btn.dataset.tiempo === 'mas' ? 'masTiempo' : btn.dataset.tiempo;
            aplicarConfiguracion();
        });
    });
    
    // Modo concentración
    const btnModoConcentracion = document.querySelector('[data-modo="concentracion"]');
    if (btnModoConcentracion) {
        btnModoConcentracion.addEventListener('click', () => {
            configActual.modoConcentracion = !configActual.modoConcentracion;
            aplicarConfiguracion();
        });
    }
    
    // Ayudas visuales
    const btnAyudas = document.querySelector('[data-ayudas="mostrar"]');
    if (btnAyudas) {
        btnAyudas.addEventListener('click', () => {
            configActual.ayudas = !configActual.ayudas;
            aplicarConfiguracion();
        });
    }
});
