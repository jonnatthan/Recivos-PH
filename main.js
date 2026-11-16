const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const XLSX = require('xlsx');
const log = require('./src/logger');
const store = require('./src/store');
const license = require('./src/license');
const sheets = require('./src/sheets');
const jelpit = require('./src/jelpit');
const pdf = require('./src/pdf');
const mailer = require('./src/mailer');
const wa = require('./src/whatsapp');
const updater = require('./src/updater');

// Una sola instancia de la aplicación (evita dos ventanas peleando por la sesión de WhatsApp)
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;
const enviarEvento = (canal, datos) => win && !win.isDestroyed() && win.webContents.send(canal, datos);

// ---- Registro de errores para soporte ----
process.on('uncaughtException', (e) => log.error('uncaughtException', e));
process.on('unhandledRejection', (e) => log.error('unhandledRejection', e));

// ---- Copias de seguridad automáticas (diarias, se conservan 14) ----
const carpetaCopias = () => path.join(store.dir(), 'copias');

function copiaAutomatica() {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const destino = path.join(carpetaCopias(), `auto_${hoy}.nexa`);
    fs.mkdirSync(carpetaCopias(), { recursive: true });
    if (!fs.existsSync(destino)) {
      fs.writeFileSync(destino, JSON.stringify({ _nexatechBackup: true, fecha: hoy, auto: true, datos: store.load() }, null, 2), 'utf8');
      log.info('Copia automática creada:', destino);
    }
    const viejas = fs.readdirSync(carpetaCopias()).filter((f) => /^auto_\d{4}-\d{2}-\d{2}\.nexa$/.test(f)).sort();
    viejas.slice(0, Math.max(0, viejas.length - 14)).forEach((f) => fs.rmSync(path.join(carpetaCopias(), f), { force: true }));
  } catch (e) {
    log.error('Falló la copia automática', e);
  }
}

function estadoCopias() {
  try {
    const lista = fs.existsSync(carpetaCopias())
      ? fs.readdirSync(carpetaCopias()).filter((f) => f.endsWith('.nexa')).sort()
      : [];
    return { carpeta: carpetaCopias(), total: lista.length, ultima: lista.length ? lista[lista.length - 1].replace(/^auto_|\.nexa$/g, '') : '' };
  } catch {
    return { carpeta: carpetaCopias(), total: 0, ultima: '' };
  }
}

function informeSoporte() {
  const lic = store.estadoLicencia();
  const d = store.load();
  const w = wa.estado();
  const lineas = [
    '===== INFORME DE SOPORTE · NexaPH Pro =====',
    `Fecha: ${new Date().toLocaleString('es-CO')}`,
    `Versión: ${app.getVersion()} | Electron ${process.versions.electron} | Node ${process.versions.node}`,
    `Sistema: ${os.type()} ${os.release()} ${os.arch()} | RAM libre ${(os.freemem() / 1073741824).toFixed(1)} GB`,
    `Equipo: ${license.obtenerEquipoId()}`,
    `Licencia: ${lic.valida ? 'VÁLIDA' : 'NO VÁLIDA'} | ${lic.plan || '-'} | vence ${lic.vence || '-'} | cliente ${lic.cliente || '-'}${lic.demo ? ' | DEMO' : ''}`,
    `Unidades: ${(d.unidades || []).length}`,
    `WhatsApp: ${w.estado}${w.error ? ' (' + w.error + ')' : ''}`,
    `Copias automáticas: ${JSON.stringify(estadoCopias())}`,
    '',
    '----- Últimos eventos -----',
    log.ultimasLineas(150)
  ];
  return lines_redact(lineas.join('\n'));
}
const lines_redact = (t) => log.redactar(t);

function crearVentana() {
  win = new BrowserWindow({
    width: 1340,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'NexaPH Pro · NEXATECH',
    icon: path.join(__dirname, 'src', 'renderer', 'assets', 'icon.png'),
    backgroundColor: '#0e131f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  // La ventana nunca debe navegar fuera de la app ni abrir ventanas propias: los enlaces van al navegador
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });
  win.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));
  win.webContents.once('did-finish-load', () => {
    const waDir = path.join(store.dir(), 'whatsapp');
    if (fs.existsSync(path.join(waDir, 'session'))) {
      setTimeout(() => {
        wa.iniciar(waDir, (d) => enviarEvento('wa:evento', d), false).catch((e) => log.error('Reconexión WhatsApp', e));
      }, 1200);
    }
  });

  updater.inicializar((d) => enviarEvento('update:evento', d));
  setTimeout(() => {
    updater.buscarActualizacion(true);
  }, 5000);
}

app.whenReady().then(() => {
  log.iniciar(store.dir());
  log.info('Inicio de NexaPH Pro', app.getVersion());
  crearVentana();
  setTimeout(copiaAutomatica, 4000);
  setInterval(copiaAutomatica, 6 * 60 * 60 * 1000);
});
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on('before-quit', () => {
  wa.destruir().catch(() => {});
});
app.on('window-all-closed', async () => {
  await wa.destruir();
  app.quit();
});

// ---- Soporte y copias ----
ipcMain.handle('soporte:copiarInforme', () => {
  const t = informeSoporte();
  clipboard.writeText(t);
  return { ok: true, lineas: t.split('\n').length };
});
ipcMain.handle('soporte:abrirLogs', () => (log.rutaCarpeta() ? shell.openPath(log.rutaCarpeta()) : ''));
ipcMain.handle('backup:estadoAuto', () => estadoCopias());
ipcMain.handle('backup:abrirCarpetaAuto', () => {
  fs.mkdirSync(carpetaCopias(), { recursive: true });
  return shell.openPath(carpetaCopias());
});

// ---- Auto-Updater ----
ipcMain.handle('update:estado', () => updater.estado());
ipcMain.handle('update:buscar', () => updater.buscarActualizacion(false));
ipcMain.handle('update:instalar', () => updater.instalarAhora());

// ---- Licencias ----
ipcMain.handle('licencia:estado', () => store.estadoLicencia());
ipcMain.handle('licencia:activar', (_e, codigo) => store.activarLicencia(codigo));
ipcMain.handle('licencia:verificarUnidad', (_e, codigo, nit) => store.verificarLicenciaUnidad(codigo, nit));

// ---- Autenticación y Usuarios ----
ipcMain.handle('auth:estado', () => ({ primeraVez: store.primeraVez() }));
ipcMain.handle('auth:login', (_e, u, p) => store.verificarLogin(u, p));
ipcMain.handle('auth:registrar', (_e, u, nombre, p) => store.registrarUsuario(u, nombre, p));
ipcMain.handle('auth:cambiar', (_e, u, pAct, pNueva) => store.cambiarLogin(u, pAct, pNueva));
ipcMain.handle('auth:recuperar', (_e, u, llave, pNueva) => store.restablecerPassword(u, llave, pNueva));
ipcMain.handle('auth:eliminar', (_e, u) => store.eliminarUsuario(u));

// ---- Almacenamiento y Copia de Seguridad ----
ipcMain.handle('store:get', () => store.load());
ipcMain.handle('store:set', (_e, datos) => store.save(datos));
ipcMain.handle('secreto:set', (_e, id, valor) => store.setSecreto(id, valor));
ipcMain.handle('secreto:tiene', (_e, id) => !!store.getSecreto(id));

ipcMain.handle('backup:exportar', async () => {
  const fecha = new Date().toISOString().slice(0, 10);
  const r = await dialog.showSaveDialog(win, {
    defaultPath: `Respaldo_NEXATECH_${fecha}.nexa`,
    filters: [{ name: 'Copia de seguridad NEXATECH (.nexa)', extensions: ['nexa', 'json'] }]
  });
  if (r.canceled || !r.filePath) return null;
  const datos = store.load();
  fs.writeFileSync(r.filePath, JSON.stringify({ _nexatechBackup: true, fecha, datos }, null, 2), 'utf8');
  return { ok: true, ruta: r.filePath };
});

ipcMain.handle('backup:importar', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Copia de seguridad NEXATECH (.nexa)', extensions: ['nexa', 'json'] }]
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const raw = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
  const datos = raw?._nexatechBackup && raw.datos ? raw.datos : raw;
  if (!datos || !Array.isArray(datos.unidades)) {
    throw new Error('El archivo seleccionado no es una copia de seguridad válida de NEXATECH.');
  }
  store.save(datos);
  return { ok: true, datos: store.load() };
});

// ---- Archivos ----
ipcMain.handle('archivo:abrir', async (_e, filtros, comoDataUrl) => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: filtros });
  if (r.canceled || !r.filePaths[0]) return null;
  const ruta = r.filePaths[0];
  if (!comoDataUrl) return { ruta };
  const ext = path.extname(ruta).slice(1).toLowerCase().replace('jpg', 'jpeg');
  const b64 = fs.readFileSync(ruta).toString('base64');
  return { ruta, dataUrl: `data:image/${ext};base64,${b64}` };
});
ipcMain.handle('carpeta:abrir', (_e, ruta) => shell.openPath(ruta));
ipcMain.handle('url:abrir', (_e, url) => shell.openExternal(url));
ipcMain.handle('carpeta:recibos', (_e, unidad, periodo) => pdf.carpeta(unidad, periodo));
ipcMain.handle('ventana:enfocar', () => {
  if (win && !win.isDestroyed()) {
    win.blur();
    win.focus();
    win.webContents.focus();
  }
  return true;
});

ipcMain.handle('excel:exportar', async (_e, filas, nombre) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: nombre,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  });
  if (r.canceled || !r.filePath) return null;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'Estado');
  XLSX.writeFile(wb, r.filePath);
  return r.filePath;
});

// ---- Datos ----
ipcMain.handle('hoja:cargar', (_e, fuente) => sheets.cargar(fuente));
ipcMain.handle('jelpit:importar', (_e, ruta, filas) => jelpit.importar(ruta, filas));

// ---- PDF y QR ----
ipcMain.handle('pdf:generar', (_e, unidad, fila, periodo) => pdf.generar(unidad, fila, periodo));
ipcMain.handle('pdf:pazysalvo', (_e, unidad, fila, periodo) => pdf.generarPazYSalvo(unidad, fila, periodo));
ipcMain.handle('pdf:informe', (_e, unidad, lista, pagosPeriodo, periodo) => pdf.generarInformeConsejo(unidad, lista, pagosPeriodo, periodo));
ipcMain.handle('pdf:comparendo', (_e, unidad, sancion, periodo) => pdf.generarComparendo(unidad, sancion, periodo));
ipcMain.handle('pdf:qr', (_e, texto) => pdf.qrImagen(texto));

// ---- Correo ----
ipcMain.handle('correo:probar', (_e, unidadId, cfg) => mailer.probar(cfg, store.getSecreto(unidadId)));
ipcMain.handle('correo:enviar', (_e, unidadId, cfg, msg) => mailer.enviar(cfg, store.getSecreto(unidadId), msg));

// ---- WhatsApp ----
ipcMain.handle('wa:iniciar', (_e, forzar) => wa.iniciar(path.join(store.dir(), 'whatsapp'), (d) => enviarEvento('wa:evento', d), Boolean(forzar)));
ipcMain.handle('wa:estado', () => wa.estado());
ipcMain.handle('wa:enviar', (_e, tel, texto, archivo) => wa.enviar(tel, texto, archivo));
ipcMain.handle('wa:cerrar', () => wa.cerrar());
