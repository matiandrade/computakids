// js/tecnologo.js
// Lee datos globales de todos los estudiantes y calcula métricas de impacto

const ESTUDIANTE_KEY = 'appPensamientoEstudiantes';

function cargarTodos() {
  try {
    const raw = localStorage.getItem(ESTUDIANTE_KEY);
    return raw ? Object.values(JSON.parse(raw)) : [];
  } catch(e) { return []; }
}

function calcularMetricas(alumnos) {
  let sesiones = 0;
  let aciertosBio = 0, intentosBio = 0;
  let aciertosMat = 0, intentosMat = 0;
  let aciertosMus = 0, intentosMus = 0;

  alumnos.forEach(a => {
    sesiones += a.intentos;
    const bio = a.progreso.biologia;
    const mat = a.progreso.matematica;
    const mus = a.progreso.musica;

    ['explorar','resolver','crear'].forEach(n => {
      aciertosBio += bio[n].aciertos; intentosBio += bio[n].intentos;
      aciertosMat += mat[n].aciertos; intentosMat += mat[n].intentos;
      aciertosMus += mus[n].aciertos; intentosMus += mus[n].intentos;
    });
  });

  return {
    sesiones,
    pctBio: intentosBio ? Math.round((aciertosBio / intentosBio) * 100) : 0,
    pctMat: intentosMat ? Math.round((aciertosMat / intentosMat) * 100) : 0,
    pctMus: intentosMus ? Math.round((aciertosMus / intentosMus) * 100) : 0,
  };
}

function actualizarBarras(metricas) {
  document.getElementById('stat-sesiones').textContent = metricas.sesiones;

  ['bio', 'mat', 'mus'].forEach((key, i) => {
    const pct = [metricas.pctBio, metricas.pctMat, metricas.pctMus][i];
    const barEl = document.getElementById('bar-' + key);
    const pctEl = document.getElementById('pct-' + key);
    if (barEl) barEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  });
}

function exportarInforme() {
  const alumnos = cargarTodos();
  const metricas = calcularMetricas(alumnos);
  const fecha = new Date().toLocaleDateString('es-AR');

  const lineas = [
    'INFORME DE PROGRESO — COMPUTAKIDS',
    'EEP N° 80 El Calafate — Ciclo lectivo 2027',
    `Generado: ${fecha}`,
    '',
    `Total alumnos: ${alumnos.length}`,
    `Sesiones totales: ${metricas.sesiones}`,
    `Rendimiento Biología: ${metricas.pctBio}%`,
    `Rendimiento Matemática: ${metricas.pctMat}%`,
    `Rendimiento Música: ${metricas.pctMus}%`,
    '',
    'DETALLE POR ALUMNO:',
    ...alumnos.map(a =>
      `${a.nombre} — Puntaje: ${a.puntaje} — Aciertos: ${a.aciertos}/${a.intentos}`
    )
  ];

  const blob = new Blob([lineas.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `informe_computakids_${fecha.replace(/\//g,'-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetearDatos() {
  if (confirm('¿Reiniciar todos los datos de estudiantes? Esta acción no se puede deshacer.')) {
    localStorage.removeItem(ESTUDIANTE_KEY);
    localStorage.removeItem('appPensamientoAlumnoActivo');
    location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const alumnos = cargarTodos();
  const metricas = calcularMetricas(alumnos);
  actualizarBarras(metricas);
});
