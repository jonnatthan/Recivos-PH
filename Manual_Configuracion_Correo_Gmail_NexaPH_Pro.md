# 📘 Guía de Configuración de Correo Gmail para Envío de Recibos
**Software:** NexaPH Pro *(by NEXATECH)*  
**Dirigido a:** Administradores y Consejos de Propiedad Horizontal  

---

## 🎯 ¿Por qué se necesita una «Contraseña de Aplicación» de 16 letras?

Por políticas de seguridad de Google, ningún sistema empresarial externo puede enviar correos usando la contraseña normal de tu cuenta de Gmail.  
En su lugar, Google permite generar una **Contraseña de Aplicación de 16 letras**: una llave exclusiva y segura que autoriza a **NexaPH Pro** a enviar los recibos en PDF desde el correo oficial de la administración sin exponer tu clave personal.

> **IMPORTANTE:** Para que Google habilite la opción **«Contraseñas de aplicación»**, es **obligatorio** tener activada primero la **«Verificación en 2 pasos»** en la cuenta de Gmail del conjunto residencial.

---

## 🛠️ Paso a Paso para Configurar el Correo (Toma 2 minutos)

### Paso 1: Activar la «Verificación en 2 pasos» en el Gmail de la Administración

1. Inicia sesión en el navegador con el correo Gmail de la unidad o administración (ejemplo: `administracionconjunto@gmail.com`).
2. Entra a la página de **Verificación en 2 pasos de tu Cuenta de Google**:  
   https://myaccount.google.com/signinoptions/two-step-verification
3. Haz clic en **Activar la verificación en 2 pasos**, ingresa el número de celular de la administración y confirma el código que llega por mensaje de texto (SMS).

---

### Paso 2: Generar la Contraseña de Aplicación de 16 letras

Una vez que la Verificación en 2 pasos diga **«Activada»**:

1. Entra al panel oficial de **Contraseñas de aplicación de Google**:  
   https://myaccount.google.com/apppasswords
2. En el campo **«Nombre de la app»**, escribe: `NexaPH Pro`
3. Haz clic en el botón **Crear**.
4. Google mostrará en pantalla un recuadro amarillo con **16 letras agrupadas en 4 bloques** (por ejemplo: `abcd efgh ijkl mnop`).
5. **Copia esas 16 letras** y haz clic en *Hecho*.

---

### Paso 3: Conectar y Verificar en NexaPH Pro

1. Abre **NexaPH Pro** y entra en el menú izquierdo a **⚙️ Unidad y Licencia**.
2. Ubica la tarjeta **✉️ Correo electrónico para envíos (Gmail)** y completa:
   - **Correo Gmail remitente:** El correo de la administración (ej. `arboledadelcampoph@gmail.com`).
   - **Nombre visible del remitente:** El nombre que verán los propietarios al recibir el correo (ej. `CONJUNTO MIXTO ARBOLEDA DEL CAMPO P.H.`).
   - **Contraseña de aplicación de Google (16 letras):** Pega aquí las 16 letras que te dio Google en el Paso 2.
3. Haz clic en **💾 Guardar correo de la unidad**.
4. Haz clic en **✓ Verificar conexión** (verás el aviso *«✓ Conexión de correo Gmail verificada correctamente»*).
5. Para hacer una prueba real con recibo adjunto, escribe tu correo en **«Enviar recibo PDF de prueba a este correo»** y pulsa **📨 Enviar PDF de prueba**.
