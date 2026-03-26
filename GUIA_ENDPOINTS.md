# 🎯 Guía Paso a Paso - Endpoints de Pinata

## 📋 Requisitos Previos

✅ Servidor corriendo: `npm run start:dev`  
✅ URL base: `http://localhost:3000`

---

## 🚀 ENDPOINT 1: Subir Archivo JSON (Recomendado)

### POST `/pinata/upload-json`

**Este es el método más fácil para subir datos JSON.**

### 📝 Paso a Paso

#### **Opción A: Con cURL (Terminal)**

```bash
curl -X POST http://localhost:3000/pinata/upload-json ^
  -H "Content-Type: application/json" ^
  -d "{\"data\": {\"nombre\": \"Juan\", \"edad\": 30, \"ciudad\": \"Madrid\"}, \"filename\": \"usuario.json\"}"
```

#### **Opción B: Con PowerShell**

```powershell
$body = @{
    data = @{
        nombre = "Juan"
        edad = 30
        ciudad = "Madrid"
    }
    filename = "usuario.json"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/pinata/upload-json" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### **Opción C: Con Postman**

1. Abre Postman
2. **Método**: POST
3. **URL**: `http://localhost:3000/pinata/upload-json`
4. **Headers**: 
   - Key: `Content-Type`
   - Value: `application/json`
5. **Body** → Selecciona `raw` → Tipo: `JSON`
6. Pega este JSON:
```json
{
  "data": {
    "nombre": "Juan",
    "edad": 30,
    "ciudad": "Madrid"
  },
  "filename": "usuario.json"
}
```
7. Click en **Send**

### ✅ Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "id": "019b9f38-39ea-714c-9686-96334f8e5b93",
    "name": "usuario.json",
    "cid": "bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv",
    "size": 65,
    "number_of_files": 1,
    "mime_type": "application/json",
    "group_id": null
  },
  "message": "JSON subido exitosamente a Pinata"
}
```

**⚠️ IMPORTANTE: Guarda el `cid` de la respuesta, lo necesitarás para recuperar el archivo.**

---

## 📤 ENDPOINT 2: Subir Archivo Físico

### POST `/pinata/upload`

**Para subir cualquier tipo de archivo (PDF, imagen, texto, etc.)**

### 📝 Paso a Paso

#### **Opción A: Con cURL**

```bash
curl -X POST http://localhost:3000/pinata/upload ^
  -F "file=@C:\ruta\al\archivo\documento.pdf"
```

#### **Opción B: Con PowerShell**

```powershell
$filePath = "C:\ruta\al\archivo\documento.pdf"

$form = @{
    file = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri "http://localhost:3000/pinata/upload" `
    -Method Post `
    -Form $form
```

#### **Opción C: Con Postman**

1. **Método**: POST
2. **URL**: `http://localhost:3000/pinata/upload`
3. **Body** → Selecciona `form-data`
4. **Key**: `file` (cambia el tipo a `File` en el dropdown)
5. **Value**: Click en "Select Files" y selecciona tu archivo
6. Click en **Send**

### ✅ Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "id": "abc123-def456",
    "name": "documento.pdf",
    "cid": "bafybeihgxdzljxb26q6nf3r3eifqeedsvt2eubqtskghpme66cgjyw4fra",
    "size": 245678,
    "number_of_files": 1,
    "mime_type": "application/pdf",
    "group_id": null
  },
  "message": "Archivo subido exitosamente a Pinata"
}
```

---

## 📥 ENDPOINT 3: Obtener Archivo por CID

### GET `/pinata/file/:cid`

**Recupera cualquier archivo usando su CID**

### 📝 Paso a Paso

Usa el `cid` que obtuviste al subir el archivo:

#### **Con cURL**

```bash
curl http://localhost:3000/pinata/file/bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv
```

#### **Con PowerShell**

```powershell
$cid = "bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv"
Invoke-RestMethod -Uri "http://localhost:3000/pinata/file/$cid"
```

#### **Con Navegador**

Simplemente abre en tu navegador:
```
http://localhost:3000/pinata/file/bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv
```

### ✅ Respuesta

```json
{
  "success": true,
  "data": "contenido del archivo",
  "contentType": "application/json",
  "message": "Archivo obtenido exitosamente"
}
```

---

## 🔍 ENDPOINT 4: Obtener JSON Parseado por CID

### GET `/pinata/json/:cid`

**Recupera un archivo JSON ya parseado como objeto**

### 📝 Paso a Paso

#### **Con cURL**

```bash
curl http://localhost:3000/pinata/json/bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv
```

#### **Con PowerShell**

```powershell
$cid = "bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv"
$datos = Invoke-RestMethod -Uri "http://localhost:3000/pinata/json/$cid"
Write-Host "Nombre:" $datos.data.nombre
Write-Host "Edad:" $datos.data.edad
```

### ✅ Respuesta

```json
{
  "success": true,
  "data": {
    "nombre": "Juan",
    "edad": 30,
    "ciudad": "Madrid"
  },
  "message": "JSON obtenido exitosamente"
}
```

---

## 📋 ENDPOINT 5: Listar Todos los Archivos

### GET `/pinata/files`

**Obtiene la lista de todos los archivos subidos**

### 📝 Paso a Paso

#### **Con cURL**

```bash
curl http://localhost:3000/pinata/files
```

#### **Con PowerShell**

```powershell
$archivos = Invoke-RestMethod -Uri "http://localhost:3000/pinata/files"
$archivos.data.files | Format-Table name, cid, size
```

#### **Con Navegador**

```
http://localhost:3000/pinata/files
```

### ✅ Respuesta

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "abc123",
        "name": "usuario.json",
        "cid": "bafkreiabc123",
        "size": 65,
        "mime_type": "application/json",
        "created_at": "2026-01-08T19:50:00.000Z"
      },
      {
        "id": "def456",
        "name": "documento.pdf",
        "cid": "bafkreidef456",
        "size": 245678,
        "mime_type": "application/pdf",
        "created_at": "2026-01-08T19:55:00.000Z"
      }
    ]
  },
  "message": "Archivos listados exitosamente"
}
```

---

## 🗑️ ENDPOINT 6: Eliminar Archivo

### DELETE `/pinata/file/:fileId`

**Elimina un archivo usando su ID (NO el CID)**

### 📝 Paso a Paso

⚠️ **NOTA**: Usa el `id` (no el `cid`) que obtuviste al subir o listar archivos.

#### **Con cURL**

```bash
curl -X DELETE http://localhost:3000/pinata/file/019b9f38-39ea-714c-9686-96334f8e5b93
```

#### **Con PowerShell**

```powershell
$fileId = "019b9f38-39ea-714c-9686-96334f8e5b93"
Invoke-RestMethod -Uri "http://localhost:3000/pinata/file/$fileId" -Method Delete
```

### ✅ Respuesta

```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

---

## 🎓 Ejemplos Prácticos Completos

### Ejemplo 1: Subir y Recuperar Datos de Proyecto

```powershell
# 1. Subir datos del proyecto
$proyecto = @{
    data = @{
        nombre = "Reforesta 2026"
        ubicacion = "Madrid"
        arboles = 1000
        fecha = "2026-01-08"
    }
    filename = "proyecto-reforesta.json"
} | ConvertTo-Json

$resultado = Invoke-RestMethod -Uri "http://localhost:3000/pinata/upload-json" `
    -Method Post `
    -ContentType "application/json" `
    -Body $proyecto

Write-Host "✅ Archivo subido con CID:" $resultado.data.cid

# 2. Recuperar los datos
$cid = $resultado.data.cid
$datos = Invoke-RestMethod -Uri "http://localhost:3000/pinata/json/$cid"

Write-Host "📊 Datos recuperados:"
Write-Host "Nombre del proyecto:" $datos.data.nombre
Write-Host "Árboles plantados:" $datos.data.arboles
```

### Ejemplo 2: Subir Múltiples Archivos JSON

```powershell
$sensores = @(
    @{ temperatura = 22; humedad = 65; hora = "08:00" }
    @{ temperatura = 24; humedad = 60; hora = "12:00" }
    @{ temperatura = 20; humedad = 70; hora = "18:00" }
)

foreach ($i in 0..($sensores.Count - 1)) {
    $body = @{
        data = $sensores[$i]
        filename = "sensor-$($i+1).json"
    } | ConvertTo-Json
    
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/pinata/upload-json" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Sensor $($i+1) subido. CID:" $resultado.data.cid
}
```

### Ejemplo 3: Listar y Eliminar Archivos Antiguos

```powershell
# 1. Listar todos los archivos
$archivos = Invoke-RestMethod -Uri "http://localhost:3000/pinata/files"

Write-Host "📋 Total de archivos:" $archivos.data.files.Count

# 2. Mostrar archivos JSON
$archivosJson = $archivos.data.files | Where-Object { $_.mime_type -eq "application/json" }
$archivosJson | Format-Table name, cid, size

# 3. Eliminar un archivo específico (opcional)
# $fileId = $archivosJson[0].id
# Invoke-RestMethod -Uri "http://localhost:3000/pinata/file/$fileId" -Method Delete
# Write-Host "🗑️ Archivo eliminado"
```

---

## 🔄 Flujo de Trabajo Completo

### Escenario: Guardar y Recuperar Configuración de Aplicación

```powershell
# Paso 1: Crear configuración
$config = @{
    data = @{
        app_name = "Mi Aplicación"
        version = "1.0.0"
        settings = @{
            tema = "oscuro"
            idioma = "es"
            notificaciones = $true
        }
        ultima_actualizacion = (Get-Date -Format "yyyy-MM-dd")
    }
    filename = "config-app.json"
} | ConvertTo-Json -Depth 3

# Paso 2: Subir a Pinata
Write-Host "⏳ Subiendo configuración..."
$upload = Invoke-RestMethod -Uri "http://localhost:3000/pinata/upload-json" `
    -Method Post `
    -ContentType "application/json" `
    -Body $config

$cid = $upload.data.cid
Write-Host "✅ Configuración guardada con CID: $cid"
Write-Host "💾 ID del archivo: $($upload.data.id)"

# Paso 3: Guardar el CID en un archivo local (para referencia)
$cid | Out-File -FilePath "config-cid.txt"
Write-Host "📝 CID guardado en config-cid.txt"

# Paso 4: Recuperar la configuración más tarde
Write-Host "`n⏳ Recuperando configuración..."
$configRecuperada = Invoke-RestMethod -Uri "http://localhost:3000/pinata/json/$cid"

Write-Host "✅ Configuración recuperada:"
Write-Host "App:" $configRecuperada.data.app_name
Write-Host "Versión:" $configRecuperada.data.version
Write-Host "Tema:" $configRecuperada.data.settings.tema
```

---

## 📊 Tabla Resumen de Endpoints

| Método | Endpoint | Propósito | Tipo de Body |
|--------|----------|-----------|--------------|
| POST | `/pinata/upload-json` | Subir JSON | `application/json` |
| POST | `/pinata/upload` | Subir archivo | `multipart/form-data` |
| GET | `/pinata/file/:cid` | Obtener archivo | - |
| GET | `/pinata/json/:cid` | Obtener JSON parseado | - |
| GET | `/pinata/files` | Listar archivos | - |
| DELETE | `/pinata/file/:fileId` | Eliminar archivo | - |

---

## ❓ Preguntas Frecuentes

### ¿Cuál es la diferencia entre CID e ID?

- **CID**: Identificador de contenido en IPFS. Se usa para **recuperar** archivos.
- **ID**: Identificador interno de Pinata. Se usa para **eliminar** archivos.

### ¿Puedo subir archivos grandes?

Sí, pero revisa los límites de tu plan de Pinata en [https://app.pinata.cloud](https://app.pinata.cloud)

### ¿Los archivos son públicos?

Sí, cualquiera con el CID puede acceder al archivo. No subas información sensible sin encriptar.

### ¿Cuánto tiempo duran los archivos?

Los archivos permanecen en Pinata mientras tu cuenta esté activa y dentro de los límites de tu plan.

---

## 🐛 Solución de Problemas

### Error: "Cannot POST /pinata/upload-json"

✅ **Solución**: Verifica que el servidor esté corriendo (`npm run start:dev`)

### Error 400: "Se requiere el campo data"

✅ **Solución**: Asegúrate de incluir el campo `data` en el body:
```json
{
  "data": { "tu": "objeto" },
  "filename": "archivo.json"
}
```

### Error 500: Error al subir archivo

✅ **Solución**: 
1. Verifica que tu `PINATA_JWT` sea válido
2. Revisa los logs del servidor
3. Verifica tu conexión a internet

---

## 📚 Recursos Adicionales

- 📖 [Documentación Completa](./PINATA_USAGE.md)
- 🏗️ [Arquitectura del Proyecto](./ESTRUCTURA_PROYECTO.md)
- 🧪 [Pruebas Rápidas](./PRUEBAS_RAPIDAS.md)
- 🌐 [Dashboard de Pinata](https://app.pinata.cloud)

---

**¡Listo para empezar! 🚀**

Copia y pega los ejemplos en tu terminal y empieza a usar Pinata.
