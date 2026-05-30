// js/explorar.js

let materiaSeleccionada = null;
let nivelSeleccionado = null;
const STORAGE_KEY = 'appPensamientoAccesibilidad';
const ESTUDIANTE_STORAGE_KEY = 'appPensamientoEstudiantes';

// ============================================
// SISTEMA DE GESTIÓN DE ALUMNOS Y PROGRESO
// ============================================

let alumnoActual = null;
let progresosEstudiantes = {};

function inicializarSistemaEstudiantes() {
    cargarDatosEstudiantes();
    recuperarAlumnoActivo();
    actualizarPanelAlumno();
    configurarEventosAlumno();
}

function cargarDatosEstudiantes() {
    try {
        const stored = localStorage.getItem(ESTUDIANTE_STORAGE_KEY);
        if (stored) {
            progresosEstudiantes = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('No se pudieron cargar los datos de estudiantes', e);
        progresosEstudiantes = {};
    }
}

function guardarDatosEstudiantes() {
    localStorage.setItem(ESTUDIANTE_STORAGE_KEY, JSON.stringify(progresosEstudiantes));
}

function crearPerfilEstudiante(nombre) {
    return {
        nombre: nombre,
        puntaje: 0,
        aciertos: 0,
        intentos: 0,
        progreso: {
            biologia: {
                explorar: { aciertos: 0, intentos: 0, completado: false },
                resolver: { aciertos: 0, intentos: 0, completado: false },
                crear: { aciertos: 0, intentos: 0, completado: false }
            },
            matematica: {
                explorar: { aciertos: 0, intentos: 0, completado: false },
                resolver: { aciertos: 0, intentos: 0, completado: false },
                crear: { aciertos: 0, intentos: 0, completado: false }
            },
            musica: {
                explorar: { aciertos: 0, intentos: 0, completado: false },
                resolver: { aciertos: 0, intentos: 0, completado: false },
                crear: { aciertos: 0, intentos: 0, completado: false }
            }
        }
    };
}

function guardarAlumno(nombre) {
    if (!nombre || nombre.trim() === '') {
        anunciarCambio('Por favor, ingresa un nombre válido');
        return false;
    }
    
    nombre = nombre.trim();
    
    if (!progresosEstudiantes[nombre]) {
        progresosEstudiantes[nombre] = crearPerfilEstudiante(nombre);
    }
    
    alumnoActual = nombre;
    localStorage.setItem('appPensamientoAlumnoActivo', nombre);
    guardarDatosEstudiantes();
    actualizarPanelAlumno();
    anunciarCambio(`Alumno guardado: ${nombre}`);
    return true;
}

function recuperarAlumnoActivo() {
    const alumnoGuardado = localStorage.getItem('appPensamientoAlumnoActivo');
    if (alumnoGuardado && progresosEstudiantes[alumnoGuardado]) {
        alumnoActual = alumnoGuardado;
    }
}

function actualizarPanelAlumno() {
    const inputAlumno = document.getElementById('input-alumno');
    const alumnoDisplay = document.getElementById('alumno-nombre');
    const estadisticasPanel = document.getElementById('estadisticas-panel');
    
    if (alumnoActual) {
        inputAlumno.value = alumnoActual;
        alumnoDisplay.textContent = `✅ Alumno activo: ${alumnoActual}`;
        estadisticasPanel.style.display = 'block';
        actualizarEstadisticas();
    } else {
        alumnoDisplay.textContent = 'Alumno activo: -';
        estadisticasPanel.style.display = 'none';
    }
}

function actualizarEstadisticas() {
    if (!alumnoActual || !progresosEstudiantes[alumnoActual]) return;
    
    const datos = progresosEstudiantes[alumnoActual];
    document.getElementById('stat-puntaje').textContent = datos.puntaje;
    document.getElementById('stat-aciertos').textContent = datos.aciertos;
    document.getElementById('stat-intentos').textContent = datos.intentos;
}

function configurarEventosAlumno() {
    const btnGuardar = document.getElementById('btn-guardar-alumno');
    const btnReiniciar = document.getElementById('btn-reiniciar-progreso');
    const inputAlumno = document.getElementById('input-alumno');
    
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            guardarAlumno(inputAlumno.value);
        });
        inputAlumno.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                guardarAlumno(inputAlumno.value);
            }
        });
    }
    
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            if (alumnoActual && confirm(`¿Estás seguro de que quieres reiniciar el progreso de ${alumnoActual}?`)) {
                progresosEstudiantes[alumnoActual] = crearPerfilEstudiante(alumnoActual);
                guardarDatosEstudiantes();
                actualizarEstadisticas();
                anunciarCambio(`Progreso de ${alumnoActual} reiniciado`);
            }
        });
    }
}

function actualizarProgreso(materia, nivel, esAcierto) {
    if (!alumnoActual || !progresosEstudiantes[alumnoActual]) return;
    
    const datos = progresosEstudiantes[alumnoActual];
    const progNivel = datos.progreso[materia][nivel];
    
    progNivel.intentos += 1;
    datos.intentos += 1;
    
    if (esAcierto) {
        progNivel.aciertos += 1;
        datos.aciertos += 1;
        datos.puntaje += 10; // +10 por acierto
    }
    
    guardarDatosEstudiantes();
    actualizarEstadisticas();
}

function marcarActividadCompletada(materia, nivel) {
    if (!alumnoActual || !progresosEstudiantes[alumnoActual]) return;
    
    const datos = progresosEstudiantes[alumnoActual];
    datos.progreso[materia][nivel].completado = true;
    datos.puntaje += 20; // Bonus por completar
    
    guardarDatosEstudiantes();
    actualizarEstadisticas();
}

const DEFAULT_SETTINGS = {
    textSize: 'mediano',
    contrast: 'normal',
    sound: 'activado',
    timeout: 'normal',
    focusMode: false,
    helpVisual: false,
    pictograms: false,
    reinforceFrequent: false,
    anticipation: false
};
let settings = cargarPreferencias();

function cargarPreferencias() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.warn('No se pudieron cargar las preferencias', e);
    }
    return { ...DEFAULT_SETTINGS };
}

function guardarPreferencias() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function initAccesibilidad() {
    document.querySelectorAll('[data-setting]').forEach(btn => {
        btn.addEventListener('click', () => handleSettingClick(btn));
    });
    document.querySelectorAll('[data-profile]').forEach(btn => {
        btn.addEventListener('click', () => handleProfileClick(btn));
    });
    aplicarPreferencias();
    actualizarPanel();
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    inicializarSistemaEstudiantes();
    initAccesibilidad();
});

function handleProfileClick(btn) {
    const profile = btn.dataset.profile;
    aplicarPerfil(profile);
    guardarPreferencias();
    aplicarPreferencias();
    actualizarPanel();
    if (profile) {
        document.querySelectorAll('[data-profile]').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        anunciarCambio(`Perfil activado: ${formatProfileName(profile)}`);
    }
}

function formatProfileName(profile) {
    const names = {
        tda: 'TDA',
        autismo: 'Autismo',
        down: 'Down',
        retraso: 'Retraso madurativo'
    };
    return names[profile] || profile;
}

function aplicarPerfil(profile) {
    if (profile === 'tda') {
        settings.timeout = 'mas';
        settings.focusMode = true;
        settings.reinforceFrequent = true;
        settings.anticipation = true;
    } else if (profile === 'autismo') {
        settings.sound = 'silenciado';
        settings.focusMode = true;
        settings.anticipation = true;
    } else if (profile === 'down') {
        settings.textSize = 'grande';
        settings.pictograms = true;
        settings.helpVisual = true;
    } else if (profile === 'retraso') {
        settings.textSize = 'grande';
        settings.timeout = 'mas';
        settings.helpVisual = true;
    }
}

function handleSettingClick(btn) {
    const setting = btn.dataset.setting;
    const value = btn.dataset.value;
    if (value === 'toggle') {
        settings[setting] = !settings[setting];
    } else if (value) {
        settings[setting] = value;
    }
    document.querySelectorAll('[data-profile]').forEach(p => p.classList.remove('active'));
    guardarPreferencias();
    aplicarPreferencias();
    actualizarPanel();
    anunciarCambio(`Configuración actualizada: ${formatoPreferencia(setting)}`);
}

function formatoPreferencia(setting) {
    switch (setting) {
        case 'textSize': return `Tamaño de texto ${settings.textSize}`;
        case 'contrast': return `Contraste ${settings.contrast}`;
        case 'sound': return `Sonidos ${settings.sound}`;
        case 'timeout': return `Tiempo de espera ${settings.timeout}`;
        case 'focusMode': return settings.focusMode ? 'Modo concentración activado' : 'Modo concentración desactivado';
        case 'helpVisual': return settings.helpVisual ? 'Ayuda visual activada' : 'Ayuda visual desactivada';
        case 'pictograms': return settings.pictograms ? 'Pictogramas activados' : 'Pictogramas desactivados';
        case 'reinforceFrequent': return settings.reinforceFrequent ? 'Refuerzo frecuente activado' : 'Refuerzo frecuente desactivado';
        case 'anticipation': return settings.anticipation ? 'Anticipación activada' : 'Anticipación desactivada';
        default: return '';
    }
}

function aplicarPreferencias() {
    document.body.classList.toggle('high-contrast', settings.contrast === 'alto');
    document.body.classList.toggle('focus-mode', settings.focusMode);
    document.body.classList.toggle('help-visible', settings.helpVisual);
    document.body.classList.toggle('show-pictograms', settings.pictograms);

    const fontSizeMap = {
        pequenio: '16px',
        mediano: '18px',
        grande: '24px',
        extra: '32px'
    };
    document.documentElement.style.fontSize = fontSizeMap[settings.textSize] || '18px';
}

function actualizarPanel() {
    document.querySelectorAll('[data-setting]').forEach(btn => {
        const setting = btn.dataset.setting;
        const value = btn.dataset.value;
        if (!value || value === 'toggle') {
            btn.classList.toggle('active', settings[setting] === true || (value === 'toggle' && settings[setting] === true));
            if (value === 'toggle') {
                btn.setAttribute('aria-pressed', settings[setting]);
            }
        } else {
            btn.classList.toggle('active', settings[setting] === value);
        }
    });
}

function anunciarCambio(texto) {
    const region = document.getElementById('config-announcements');
    if (region) {
        region.textContent = texto;
    }
}

function getTimeoutValue() {
    return settings.timeout === 'mas' ? 8000 : 3000;
}

function showMessage(anuncios, texto, tipo = 'info') {
    if (!anuncios) return;
    anuncios.textContent = texto;
    if (tipo === 'persistent') return;
    if (window.__mensajeTimer) clearTimeout(window.__mensajeTimer);
    window.__mensajeTimer = setTimeout(() => {
        anuncios.textContent = '';
    }, getTimeoutValue());
}

function crearActividadConProgreso(contenedor, titulo, pregunta, opciones, correcta, category, materia, nivel) {
    contenedor.innerHTML = `<h2 class="activity-title">${titulo}</h2>`;

    const progresoText = document.createElement('p');
    progresoText.textContent = 'Progreso: 0 de 3';
    progresoText.style.fontWeight = '600';
    progresoText.style.marginTop = '16px';
    progresoText.style.textAlign = 'center';
    contenedor.appendChild(progresoText);

    const progresoWrapper = document.createElement('div');
    progresoWrapper.className = 'progress-wrapper';
    progresoWrapper.setAttribute('aria-label', 'Barra de progreso para actividad');
    progresoWrapper.style.margin = '8px auto';
    progresoWrapper.style.maxWidth = '360px';
    progresoWrapper.style.backgroundColor = '#e0e0e0';
    progresoWrapper.style.borderRadius = '12px';
    progresoWrapper.style.overflow = 'hidden';
    progresoWrapper.style.height = '20px';
    const progresoFill = document.createElement('div');
    progresoFill.className = 'progress-fill';
    progresoFill.style.width = '0%';
    progresoFill.style.height = '100%';
    progresoFill.style.backgroundColor = '#4CAF50';
    progresoFill.style.transition = 'width 0.5s ease';
    progresoWrapper.appendChild(progresoFill);
    contenedor.appendChild(progresoWrapper);

    const anuncios = document.createElement('div');
    anuncios.id = 'anuncios';
    anuncios.setAttribute('aria-live', 'polite');
    anuncios.style.marginTop = '20px';
    contenedor.appendChild(anuncios);

    const inicio = document.createElement('p');
    inicio.textContent = formatInstruction('Ahora viene una pregunta nueva', 'pregunta');
    inicio.style.fontWeight = '600';
    inicio.style.marginTop = '16px';
    contenedor.appendChild(inicio);

    const preguntaTexto = document.createElement('p');
    preguntaTexto.textContent = formatInstruction(pregunta, category);
    preguntaTexto.style.marginTop = '12px';
    contenedor.appendChild(preguntaTexto);

    const opcionesDiv = document.createElement('div');
    opcionesDiv.className = 'activity-options';
    opcionesDiv.style.display = 'flex';
    opcionesDiv.style.justifyContent = 'center';
    opcionesDiv.style.gap = '20px';
    opcionesDiv.style.flexWrap = 'wrap';
    opcionesDiv.style.marginTop = '20px';
    contenedor.appendChild(opcionesDiv);

    const btnAyuda = document.createElement('button');
    btnAyuda.textContent = 'Ayuda';
    btnAyuda.setAttribute('aria-label', 'Mostrar ayuda');
    btnAyuda.style.marginTop = '16px';
    btnAyuda.style.padding = '10px 18px';
    btnAyuda.style.fontSize = '1rem';
    btnAyuda.style.borderRadius = '10px';
    contenedor.appendChild(btnAyuda);

    let aciertos = 0;
    let correctBtn = null;

    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.textContent = opcion;
        btn.setAttribute('aria-label', `Opción ${opcion}`);
        btn.setAttribute('tabindex', '0');
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '1.2rem';
        btn.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
        opcionesDiv.appendChild(btn);

        btn.addEventListener('click', () => {
            if (opcion === correcta) {
                aciertos += 1;
                progresoFill.style.width = `${(aciertos / 3) * 100}%`;
                progresoText.textContent = `Progreso: ${aciertos} de 3`;
                btn.style.backgroundColor = '#4CAF50';
                btn.disabled = true;
                sonidoCorrecto();
                
                // Actualizar progreso del alumno
                if (materia && nivel) {
                    actualizarProgreso(materia, nivel, true);
                }
                
                if (settings.reinforceFrequent) {
                    showMessage(anuncios, '🎉 ¡Muy bien! Sigue así.', 'info');
                }
                
                // Verificar si se completó la actividad
                if (aciertos === 3) {
                    setTimeout(() => {
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                        showMessage(anuncios, '🏆 ¡Completado! +20 puntos bonus', 'persistent');
                        if (materia && nivel) {
                            marcarActividadCompletada(materia, nivel);
                        }
                    }, 1000);
                }
            } else {
                btn.style.backgroundColor = '#ff4444';
                sonidoIncorrecto();
                
                // Actualizar progreso del alumno (intento incorrecto)
                if (materia && nivel) {
                    actualizarProgreso(materia, nivel, false);
                }
                
                showMessage(anuncios, '❌ Intenta de nuevo', 'info');
                setTimeout(() => {
                    btn.style.backgroundColor = '';
                }, 800);
            }
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });

        if (opcion === correcta) correctBtn = btn;
    });

    btnAyuda.addEventListener('click', () => {
        if (!correctBtn) return;
        correctBtn.style.outline = '4px solid #FFC107';
        correctBtn.style.boxShadow = '0 0 12px rgba(255, 193, 7, 0.6)';
        setTimeout(() => {
            correctBtn.style.outline = '';
            correctBtn.style.boxShadow = '';
        }, 2000);
    });

    btnAyuda.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnAyuda.click();
        }
    });
}

// Función para seleccionar materia
function seleccionarMateria(materia, btn) {
    materiaSeleccionada = materia;
    nivelSeleccionado = null;
    // Resaltar materia
    document.querySelectorAll('.botones-materias button').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    // Mostrar niveles
    document.getElementById('botones-niveles').style.display = 'flex';
    document.querySelectorAll('.botones-niveles button').forEach(b => b.classList.remove('seleccionado'));
    document.getElementById('contenedor-nivel').innerHTML = `<p>Selecciona un nivel para la materia ${materia.charAt(0).toUpperCase() + materia.slice(1)}.</p>`;
}

// Función para cargar nivel
function cargarNivel(nivel, btn) {
    if (!materiaSeleccionada) return;
    nivelSeleccionado = nivel;
    // Resaltar nivel
    document.querySelectorAll('.botones-niveles button').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');

    // Cargar actividad específica
    if (materiaSeleccionada === 'matematica') {
        if (nivel === 'explorar') cargarExplorarMatematica();
        else if (nivel === 'resolver') cargarResolverMatematica();
        else if (nivel === 'crear') cargarCrearMatematica();
        else mostrarProximamente(nivel);
    } else if (materiaSeleccionada === 'biologia') {
        if (nivel === 'explorar') cargarExplorarBiologia();
        else mostrarProximamente(nivel);
    } else if (materiaSeleccionada === 'musica') {
        if (nivel === 'explorar') cargarExplorarMusica();
        else if (nivel === 'resolver') cargarResolverMusica();
        else if (nivel === 'crear') cargarCrearMusica();
        else mostrarProximamente(nivel);
    } else {
        mostrarProximamente(nivel);
    }
}

// Función para mostrar próximamente
function mostrarProximamente(nivel) {
    const contenedor = document.getElementById('contenedor-nivel');
    contenedor.innerHTML = `<h2>${materiaSeleccionada.charAt(0).toUpperCase() + materiaSeleccionada.slice(1)} - ${nivel.charAt(0).toUpperCase() + nivel.slice(1)}</h2><p>Próximamente...</p>`;
}

// Función para reproducir sonido correcto
function sonidoCorrecto() {
    if (settings.sound !== 'activado') return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Función para reproducir sonido incorrecto
function sonidoIncorrecto() {
    if (settings.sound !== 'activado') return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Función para crear opciones con feedback
function crearOpciones(contenedor, pregunta, opciones, correcta, callback, category = 'info', materia = null, nivel = null) {
    const p = document.createElement('p');
    p.textContent = formatInstruction(pregunta, category);
    contenedor.appendChild(p);

    const opcionesDiv = document.createElement('div');
    opcionesDiv.style.display = 'flex';
    opcionesDiv.style.justifyContent = 'center';
    opcionesDiv.style.gap = '20px';
    opcionesDiv.style.marginTop = '20px';

    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.textContent = opcion;
        btn.setAttribute('aria-label', `Opción ${opcion}`);
        btn.setAttribute('tabindex', '0');
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '1.2em';
        btn.addEventListener('click', () => verificarOpcion(btn, opcion, correcta, callback, materia, nivel));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                verificarOpcion(btn, opcion, correcta, callback, materia, nivel);
            }
        });
        opcionesDiv.appendChild(btn);
    });
    contenedor.appendChild(opcionesDiv);

    const anuncios = document.createElement('div');
    anuncios.id = 'anuncios';
    anuncios.setAttribute('aria-live', 'polite');
    anuncios.style.marginTop = '20px';
    contenedor.appendChild(anuncios);
}

function formatInstruction(texto, category) {
    if (!settings.pictograms) return texto;
    const iconos = {
        series: '🔢 ',
        pregunta: '❓ ',
        musica: '🎵 ',
        animal: '🐧 ',
        info: '💡 '
    };
    return `${iconos[category] || iconos.info}${texto}`;
}

// Función para verificar opción
function verificarOpcion(btn, seleccionada, correcta, callback, materia = null, nivel = null) {
    const anuncios = document.getElementById('anuncios');
    if (seleccionada === correcta) {
        btn.style.backgroundColor = 'green';
        sonidoCorrecto();
        showMessage(anuncios, '✅ ¡Correcto!', 'info');
        if (materia && nivel) {
            actualizarProgreso(materia, nivel, true);
        }
        if (callback) callback(true);
    } else {
        btn.style.backgroundColor = 'red';
        sonidoIncorrecto();
        showMessage(anuncios, '❌ Intenta de nuevo', 'info');
        if (materia && nivel) {
            actualizarProgreso(materia, nivel, false);
        }
        if (callback) callback(false);
    }
}

// Matemática Explorar
function cargarExplorarMatematica() {
    const contenedor = document.getElementById('contenedor-nivel');
    crearActividadConProgreso(contenedor, 'Matemática - Explorar', 'Completa la serie: 2, 4, 6, __, 10', ['7', '8', '9'], '8', 'series', 'matematica', 'explorar');
}

// Matemática Resolver
function cargarResolverMatematica() {
    const contenedor = document.getElementById('contenedor-nivel');
    contenedor.innerHTML = '<h2>Matemática - Resolver</h2>';
    crearOpciones(contenedor, '¿Qué número falta? 3 + ___ = 10', ['5', '7', '8'], '7', null, 'series', 'matematica', 'resolver');
}

// Matemática Crear
function cargarCrearMatematica() {
    const contenedor = document.getElementById('contenedor-nivel');
    contenedor.innerHTML = '<h2>Matemática - Crear</h2>';
    const p = document.createElement('p');
    p.textContent = 'Construye tu propia serie. Escribe el número que sigue: 10, 20, 30, ___';
    contenedor.appendChild(p);

    const input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('aria-label', 'Escribe el número que sigue en la serie');
    input.style.padding = '10px';
    input.style.fontSize = '1.2em';
    contenedor.appendChild(input);

    const btn = document.createElement('button');
    btn.textContent = 'Verificar';
    btn.setAttribute('aria-label', 'Verificar respuesta');
    btn.style.padding = '10px 20px';
    btn.style.marginLeft = '10px';
    btn.addEventListener('click', () => {
        const val = parseInt(input.value);
        const anuncios = document.getElementById('anuncios') || document.createElement('div');
        if (!document.getElementById('anuncios')) {
            anuncios.id = 'anuncios';
            anuncios.setAttribute('aria-live', 'polite');
            contenedor.appendChild(anuncios);
        }
        if (val === 40) {
            sonidoCorrecto();
            actualizarProgreso('matematica', 'crear', true);
            marcarActividadCompletada('matematica', 'crear');
            showMessage(anuncios, '✅ ¡Correcto! La serie continúa con 40. +20 puntos bonus', 'persistent');
        } else {
            sonidoIncorrecto();
            actualizarProgreso('matematica', 'crear', false);
            showMessage(anuncios, '❌ Intenta de nuevo. ¿Cuál es el patrón?', 'info');
        }
    });
    contenedor.appendChild(btn);

    const anuncios = document.createElement('div');
    anuncios.id = 'anuncios';
    anuncios.setAttribute('aria-live', 'polite');
    anuncios.style.marginTop = '20px';
    contenedor.appendChild(anuncios);
}

// Biología Explorar
function cargarExplorarBiologia() {
    const contenedor = document.getElementById('contenedor-nivel');
    crearActividadConProgreso(contenedor, 'Biología - Explorar', 'Clasifica este animal: El pingüino es...', ['Mamífero', 'Ave', 'Reptil'], 'Ave', 'animal', 'biologia', 'explorar');
}

// Música Explorar
function cargarExplorarMusica() {
    const contenedor = document.getElementById('contenedor-nivel');
    crearActividadConProgreso(contenedor, 'Música - Explorar', 'Reconoce el patrón rítmico: 🔴🔴⚫ | 🔴🔴⚫ | ?', ['🔴🔴⚫', '🔴⚫🔴', '⚫🔴🔴'], '🔴🔴⚫', 'musica', 'musica', 'explorar');
}

// Música Resolver
function cargarResolverMusica() {
    const contenedor = document.getElementById('contenedor-nivel');
    contenedor.innerHTML = '<h2>Música - Resolver</h2>';
    crearOpciones(contenedor, 'Completa la secuencia musical: Do - Mi - ___ - Sol - Si', ['Re', 'Fa', 'La'], 'Fa', null, 'musica', 'musica', 'resolver');
}

// Música Crear
function cargarCrearMusica() {
    const contenedor = document.getElementById('contenedor-nivel');
    contenedor.innerHTML = '<h2>Música - Crear</h2>';

    const instrucciones = document.createElement('p');
    instrucciones.textContent = 'Crea tu propio patrón rítmico usando pulso fuerte, pulso suave o silencio. Usa hasta 8 pasos.';
    contenedor.appendChild(instrucciones);

    const controles = document.createElement('div');
    controles.style.display = 'flex';
    controles.style.justifyContent = 'center';
    controles.style.gap = '12px';
    controles.style.flexWrap = 'wrap';
    controles.style.marginTop = '20px';

    const elementos = [
        { tipo: 'fuerte', etiqueta: 'Pulso fuerte', color: '#D32F2F', frecuencia: 880 },
        { tipo: 'suave', etiqueta: 'Pulso suave', color: '#1976D2', frecuencia: 660 },
        { tipo: 'silencio', etiqueta: 'Silencio', color: '#757575', frecuencia: 0 }
    ];

    const secuencia = [];
    const secuenciaVisual = document.createElement('div');
    secuenciaVisual.style.display = 'grid';
    secuenciaVisual.style.gridTemplateColumns = 'repeat(8, 40px)';
    secuenciaVisual.style.gap = '10px';
    secuenciaVisual.style.justifyContent = 'center';
    secuenciaVisual.style.marginTop = '20px';
    secuenciaVisual.setAttribute('aria-label', 'Secuencia rítmica con ocho espacios');
    secuenciaVisual.setAttribute('role', 'list');

    function actualizarSecuenciaVisual() {
        secuenciaVisual.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const elemento = document.createElement('div');
            elemento.style.width = '40px';
            elemento.style.height = '40px';
            elemento.style.border = '2px dashed #999';
            elemento.style.borderRadius = '6px';
            elemento.style.display = 'flex';
            elemento.style.alignItems = 'center';
            elemento.style.justifyContent = 'center';
            elemento.setAttribute('role', 'listitem');
            if (secuencia[i]) {
                if (secuencia[i].tipo === 'fuerte') {
                    elemento.innerHTML = '<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#D32F2F;"></span>';
                } else if (secuencia[i].tipo === 'suave') {
                    elemento.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#1976D2;"></span>';
                } else {
                    elemento.innerHTML = '<span style="display:inline-block;width:24px;height:4px;background:#757575;"></span>';
                }
            }
            secuenciaVisual.appendChild(elemento);
        }
    }

    elementos.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.etiqueta;
        btn.style.padding = '10px 16px';
        btn.style.fontSize = '1em';
        btn.style.borderRadius = '10px';
        btn.style.backgroundColor = item.tipo === 'silencio' ? '#EEEEEE' : item.color;
        btn.style.color = item.tipo === 'silencio' ? '#000' : '#fff';
        btn.setAttribute('aria-label', item.etiqueta);
        btn.addEventListener('click', () => {
            if (secuencia.length < 8) {
                secuencia.push(item);
                actualizarSecuenciaVisual();
                const anuncios = document.getElementById('anuncios');
                showMessage(anuncios, `Agregaste: ${item.etiqueta}`, 'info');
            }
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
        controles.appendChild(btn);
    });
    contenedor.appendChild(controles);
    contenedor.appendChild(secuenciaVisual);

    const acciones = document.createElement('div');
    acciones.style.display = 'flex';
    acciones.style.justifyContent = 'center';
    acciones.style.gap = '12px';
    acciones.style.flexWrap = 'wrap';
    acciones.style.marginTop = '20px';

    const btnReproducir = document.createElement('button');
    btnReproducir.textContent = 'Reproducir ritmo';
    btnReproducir.setAttribute('aria-label', 'Reproducir ritmo');
    btnReproducir.style.padding = '10px 16px';
    btnReproducir.style.fontSize = '1em';
    btnReproducir.addEventListener('click', () => reproducirSecuencia(secuencia));
    btnReproducir.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnReproducir.click();
        }
    });
    acciones.appendChild(btnReproducir);

    const btnBorrar = document.createElement('button');
    btnBorrar.textContent = 'Borrar último';
    btnBorrar.setAttribute('aria-label', 'Borrar último elemento de la secuencia');
    btnBorrar.style.padding = '10px 16px';
    btnBorrar.style.fontSize = '1em';
    btnBorrar.addEventListener('click', () => {
        if (secuencia.length > 0) {
            const eliminado = secuencia.pop();
            actualizarSecuenciaVisual();
            const anuncios = document.getElementById('anuncios');
            showMessage(anuncios, `Se borró: ${eliminado.etiqueta}`, 'info');
        }
    });
    btnBorrar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnBorrar.click();
        }
    });
    acciones.appendChild(btnBorrar);

    const btnReiniciar = document.createElement('button');
    btnReiniciar.textContent = 'Reiniciar';
    btnReiniciar.setAttribute('aria-label', 'Reiniciar secuencia');
    btnReiniciar.style.padding = '10px 16px';
    btnReiniciar.style.fontSize = '1em';
    btnReiniciar.addEventListener('click', () => {
        secuencia.length = 0;
        actualizarSecuenciaVisual();
        const anuncios = document.getElementById('anuncios');
        showMessage(anuncios, 'Secuencia reiniciada. Crea un nuevo ritmo.', 'info');
    });
    btnReiniciar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnReiniciar.click();
        }
    });
    acciones.appendChild(btnReiniciar);

    const btnGuardar = document.createElement('button');
    btnGuardar.textContent = 'Guardar secuencia';
    btnGuardar.setAttribute('aria-label', 'Guardar secuencia creada');
    btnGuardar.style.padding = '10px 16px';
    btnGuardar.style.fontSize = '1em';
    btnGuardar.style.backgroundColor = '#4CAF50';
    btnGuardar.style.color = '#fff';
    btnGuardar.addEventListener('click', () => {
        if (secuencia.length === 0) {
            const anuncios = document.getElementById('anuncios');
            showMessage(anuncios, 'Crea una secuencia antes de guardarla.', 'info');
            return;
        }
        actualizarProgreso('musica', 'crear', true);
        marcarActividadCompletada('musica', 'crear');
        const anuncios = document.getElementById('anuncios');
        showMessage(anuncios, '🏆 ¡Secuencia guardada! +20 puntos bonus', 'persistent');
    });
    btnGuardar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnGuardar.click();
        }
    });
    acciones.appendChild(btnGuardar);
    contenedor.appendChild(acciones);

    const anuncios = document.createElement('div');
    anuncios.id = 'anuncios';
    anuncios.setAttribute('aria-live', 'polite');
    anuncios.style.marginTop = '20px';
    contenedor.appendChild(anuncios);

    actualizarSecuenciaVisual();
}

function reproducirSecuencia(secuencia) {
    if (!secuencia || secuencia.length === 0) {
        const anuncios = document.getElementById('anuncios');
        if (anuncios) showMessage(anuncios, 'Agrega al menos un elemento para reproducir.', 'info');
        return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let tiempo = audioContext.currentTime;

    secuencia.forEach(item => {
        if (item.frecuencia > 0) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(item.frecuencia, tiempo);
            gain.gain.setValueAtTime(0.4, tiempo);
            osc.start(tiempo);
            osc.stop(tiempo + 0.25);
        }
        tiempo += 0.35;
    });

    setTimeout(() => {
        const anuncios = document.getElementById('anuncios');
        if (anuncios) showMessage(anuncios, 'Creaste una secuencia rítmica usando patrones y repetición.', 'persistent');
    }, secuencia.length * 350);
}