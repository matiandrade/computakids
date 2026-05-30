// js/docente.js
// Lee los datos guardados por estudiante.html (localStorage)

const ESTUDIANTE_KEY = 'appPensamientoEstudiantes';

function cargarDatosDocente() {
  let datos = {};
  try {
    const raw = localStorage.getItem(ESTUDIANTE_KEY);
    if (raw) datos = JSON.parse(raw);
  } catch(e) { datos = {}; }
  return datos;
}

function calcularPorcentaje(aciertos, intentos) {
  if (!intentos) return 0;
  return Math.round((aciertos / intentos) * 100);
}

function calcularCompletadas(progreso) {
  let completadas = 0;
  Object.values(progreso).forEach(materia => {
    Object.values(materia).forEach(nivel => {
      if (nivel.completado) completadas++;
    });
  });
  return completadas;
}

function estadoAlumno(completadas) {
  if (completadas === 9) return '<span class="badge badge-green">Completado</span>';
  if (completadas > 0) return '<span class="badge badge-blue">En curso</span>';
  return '<span class="badge badge-gray">Iniciando</span>';
}

function renderizarTabla(datos) {
  const alumnos = Object.values(datos);
  const container = document.getElementById('tabla-container');

  if (alumnos.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--color-text-muted);padding:20px 0;">Todavía no hay alumnos registrados. Los alumnos aparecen aquí cuando ingresan desde el panel de estudiantes.</p>';
    return;
  }

  let totalAciertos = 0, totalIntentos = 0, totalCompletadas = 0;
  alumnos.forEach(a => {
    totalAciertos += a.aciertos;
    totalIntentos += a.intentos;
    totalCompletadas += calcularCompletadas(a.progreso);
  });

  document.getElementById('stat-total-alumnos').textContent = alumnos.length;
  document.getElementById('stat-actividades').textContent = totalCompletadas;
  document.getElementById('stat-promedio').textContent = totalIntentos
    ? calcularPorcentaje(totalAciertos, totalIntentos) + '%'
    : '—';

  const filas = alumnos.map(alumno => {
    const bio = alumno.progreso.biologia;
    const mat = alumno.progreso.matematica;
    const mus = alumno.progreso.musica;

    const pctBio = calcularPorcentaje(
      bio.explorar.aciertos + bio.resolver.aciertos + bio.crear.aciertos,
      bio.explorar.intentos + bio.resolver.intentos + bio.crear.intentos
    );
    const pctMat = calcularPorcentaje(
      mat.explorar.aciertos + mat.resolver.aciertos + mat.crear.aciertos,
      mat.explorar.intentos + mat.resolver.intentos + mat.crear.intentos
    );
    const pctMus = calcularPorcentaje(
      mus.explorar.aciertos + mus.resolver.aciertos + mus.crear.aciertos,
      mus.explorar.intentos + mus.resolver.intentos + mus.crear.intentos
    );

    const completadas = calcularCompletadas(alumno.progreso);

    return `
      <tr>
        <td><strong>${alumno.nombre}</strong></td>
        <td>
          <div class="progress-bar"><div class="progress-fill" style="width:${pctBio}%"></div></div>
          <span style="font-size:11px;color:var(--color-text-hint)">${pctBio}%</span>
        </td>
        <td>
          <div class="progress-bar"><div class="progress-fill" style="width:${pctMat}%"></div></div>
          <span style="font-size:11px;color:var(--color-text-hint)">${pctMat}%</span>
        </td>
        <td>
          <div class="progress-bar"><div class="progress-fill" style="width:${pctMus}%"></div></div>
          <span style="font-size:11px;color:var(--color-text-hint)">${pctMus}%</span>
        </td>
        <td>${estadoAlumno(completadas)}</td>
        <td style="font-size:13px;color:var(--color-text-muted)">${alumno.puntaje} pts</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table class="data-table" aria-label="Tabla de progreso por alumno">
      <thead>
        <tr>
          <th>Alumno</th>
          <th>Biología</th>
          <th>Matemática</th>
          <th>Música</th>
          <th>Estado</th>
          <th>Puntaje</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const datos = cargarDatosDocente();
  renderizarTabla(datos);
});
