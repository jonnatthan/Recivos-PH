# Recibos de Administración

App de escritorio (Windows) para generar y enviar masivamente los recibos de administración, conectada a Google Sheets y con registro de pagos de Jelpit.

## Ejecutar / instalar
```powershell
npm install                      # solo la primera vez
node node_modules/electron/install.js   # si npm no descargó Electron
npm start                        # abrir la app
npm run dist                     # crear instalador .exe en /dist (para cualquier PC)
```

## Flujo mensual
1. **Unidad** › datos, enlace de pago de Jelpit, hoja de cálculo y correo Gmail → Guardar.
2. **Periodo** (barra lateral) › elige el mes.
3. **Recibos** › *Actualizar desde hoja* → revisa y selecciona apartamentos.
4. **Envío masivo** › conecta WhatsApp (QR una sola vez), ajusta mensajes → *Enviar a seleccionados*.
5. **Pagos** › exporta el reporte de pagos desde Jelpit e *Importar reporte Jelpit*; o marca manualmente.
   Luego puedes reenviar solo a **pendientes** como recordatorio.

## Columnas de la hoja
Ver `ejemplos/plantilla_hoja_recibos.xlsx`. Se reconocen sin importar tildes/mayúsculas:
`Torre`, `Apartamento` (obligatoria), `Propietario`, `Telefono`, `Correo`, `Valor`, `Saldo anterior`, `Otros`, `Descuento`, `Total`, `Fecha limite`, `Referencia`.
Si no hay `Total`, se calcula: Valor + Saldo anterior + Otros − Descuento. Cualquier otra columna se puede usar en mensajes como `{{nombrecolumna}}` (en minúsculas, sin espacios).

## Google Sheets
- **Enlace compartido** (más simple): Compartir › Cualquier persona con el enlace › Lector. Copia el enlace con la pestaña correcta abierta.
- **Cuenta de servicio** (privada): crea una en Google Cloud, habilita *Google Sheets API*, descarga el JSON y comparte la hoja con el correo de la cuenta de servicio.

## Gmail
Requiere verificación en 2 pasos y una **contraseña de aplicación** (myaccount.google.com › Seguridad › Contraseñas de aplicación). Se guarda cifrada en el PC.

## WhatsApp
Usa WhatsApp Web con el número de la administración (necesita Edge o Chrome instalado). Hay pausas aleatorias entre mensajes para reducir el riesgo de bloqueo; para unidades grandes, envía por tandas.

## Diseño
- **Minimalista**: logo, colores, tipografía y nota al pie por unidad.
- **Desde foto**: sube la imagen del recibo y arrastra los campos encima. El campo *Enlace de pago* queda clicable en el PDF.

## Dónde quedan los datos
- PDFs: `Documentos\Recibos Administracion\<Unidad>\<Periodo>\`
- Configuración y estados: `%APPDATA%\recibos-administracion\datos.json`
