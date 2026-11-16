const { contextBridge, ipcRenderer } = require('electron');
const inv = (c, ...a) => ipcRenderer.invoke(c, ...a);

contextBridge.exposeInMainWorld('api', {
  updateEstado: () => inv('update:estado'),
  updateBuscar: () => inv('update:buscar'),
  updateInstalar: () => inv('update:instalar'),
  onUpdate: (fn) => ipcRenderer.on('update:evento', (_e, d) => fn(d)),

  licenciaEstado: () => inv('licencia:estado'),
  licenciaActivar: (c) => inv('licencia:activar', c),
  licenciaVerificarUnidad: (c, nit) => inv('licencia:verificarUnidad', c, nit),

  authEstado: () => inv('auth:estado'),
  authLogin: (u, p) => inv('auth:login', u, p),
  authRegistrar: (u, nombre, p) => inv('auth:registrar', u, nombre, p),
  authCambiar: (u, pAct, pNueva) => inv('auth:cambiar', u, pAct, pNueva),
  authRecuperar: (u, llave, pNueva) => inv('auth:recuperar', u, llave, pNueva),
  authEliminar: (u) => inv('auth:eliminar', u),

  storeGet: () => inv('store:get'),
  storeSet: (d) => inv('store:set', d),
  secretoSet: (id, v) => inv('secreto:set', id, v),
  secretoTiene: (id, v) => inv('secreto:tiene', id, v),
  backupExportar: () => inv('backup:exportar'),
  backupImportar: () => inv('backup:importar'),
  backupEstadoAuto: () => inv('backup:estadoAuto'),
  backupAbrirCarpetaAuto: () => inv('backup:abrirCarpetaAuto'),
  soporteCopiarInforme: () => inv('soporte:copiarInforme'),
  soporteAbrirLogs: () => inv('soporte:abrirLogs'),

  abrirArchivo: (filtros, dataUrl) => inv('archivo:abrir', filtros, dataUrl),
  abrirCarpeta: (r) => inv('carpeta:abrir', r),
  abrirUrl: (u) => inv('url:abrir', u),
  carpetaRecibos: (u, p) => inv('carpeta:recibos', u, p),
  enfocarVentana: () => inv('ventana:enfocar'),
  exportarExcel: (f, n) => inv('excel:exportar', f, n),

  cargarHoja: (fuente) => inv('hoja:cargar', fuente),
  importarJelpit: (ruta, filas) => inv('jelpit:importar', ruta, filas),
  generarPdf: (u, f, p) => inv('pdf:generar', u, f, p),
  generarPazYSalvo: (u, f, p) => inv('pdf:pazysalvo', u, f, p),
  generarInformeConsejo: (u, l, pp, p) => inv('pdf:informe', u, l, pp, p),
  generarComparendo: (u, s, p) => inv('pdf:comparendo', u, s, p),
  generarQr: (t) => inv('pdf:qr', t),

  probarCorreo: (id, cfg) => inv('correo:probar', id, cfg),
  enviarCorreo: (id, cfg, msg) => inv('correo:enviar', id, cfg, msg),

  waIniciar: (forzar) => inv('wa:iniciar', forzar),
  waEstado: () => inv('wa:estado'),
  waEnviar: (t, x, a) => inv('wa:enviar', t, x, a),
  waCerrar: () => inv('wa:cerrar'),
  onWa: (fn) => ipcRenderer.on('wa:evento', (_e, d) => fn(d))
});
