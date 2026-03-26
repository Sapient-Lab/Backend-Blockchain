# 📚 Documentación de Uso - Pinata con NestJS

## 📋 Tabla de Contenidos
- [Configuración Inicial](#configuración-inicial)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Subir Archivos JSON](#subir-archivos-json)
- [Métodos del Servicio](#métodos-del-servicio)

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

Ejecuta el siguiente comando para instalar las dependencias necesarias:

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PINATA_JWT=tu_jwt_aqui
GATEWAY_URL=https://pinata-server.pinata-server.workers.dev/presigned_url
```

**¿Cómo obtener tu PINATA_JWT?**
1. Ve a [https://app.pinata.cloud/developers/keys](https://app.pinata.cloud/developers/keys)
2. Crea una nueva API Key (recomendamos permisos de Admin para desarrollo)
3. Copia el JWT y pégalo en tu archivo `.env`

### 3. Iniciar el Servidor

```bash
npm run start:dev
```

El servidor estará corriendo en `http://localhost:3000`

---

## 🚀 Endpoints Disponibles

### 1. Subir un Archivo (cualquier tipo)

**POST** `/pinata/upload`

**Tipo:** `multipart/form-data`

**Body:**
- `file`: Archivo a subir (cualquier tipo: imagen, PDF, texto, etc.)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "349f1bb2-5d59-4cab-9966-e94c028a05b7",
    "name": "archivo.pdf",
    "cid": "bafybeihgxdzljxb26q6nf3r3eifqeedsvt2eubqtskghpme66cgjyw4fra",
    "size": 4682779,
    "number_of_files": 1,
    "mime_type": "application/pdf",
    "group_id": null
  },
  "message": "Archivo subido exitosamente a Pinata"
}
```

---

### 2. Subir un JSON (Recomendado para datos estructurados)

**POST** `/pinata/upload-json`

**Content-Type:** `application/json`

**Body:**
```json
{
  "data": {
    "usuario": "Juan",
    "edad": 30,
    "ciudad": "Madrid"
  },
  "filename": "usuario.json"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "abc123-def456",
    "name": "usuario.json",
    "cid": "bafkreiabcd1234567890xyz",
    "size": 89,
    "number_of_files": 1,
    "mime_type": "application/json",
    "group_id": null
  },
  "message": "JSON subido exitosamente a Pinata"
}
```

---

### 3. Obtener un Archivo por CID

**GET** `/pinata/file/:cid`

**Ejemplo:**
```
GET http://localhost:3000/pinata/file/bafkreiabcd1234567890xyz
```

**Respuesta:**
```json
{
  "success": true,
  "data": "contenido del archivo",
  "contentType": "application/json",
  "message": "Archivo obtenido exitosamente"
}
```

---

### 4. Obtener un JSON por CID (Parseado)

**GET** `/pinata/json/:cid`

**Ejemplo:**
```
GET http://localhost:3000/pinata/json/bafkreiabcd1234567890xyz
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": "Juan",
    "edad": 30,
    "ciudad": "Madrid"
  },
  "message": "JSON obtenido exitosamente"
}
```

---

### 5. Listar Todos los Archivos

**GET** `/pinata/files`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "abc123",
        "name": "archivo1.json",
        "cid": "bafkreiabc123",
        "size": 1234,
        "created_at": "2026-01-08T10:30:00Z"
      }
    ]
  },
  "message": "Archivos listados exitosamente"
}
```

---

### 6. Eliminar un Archivo

**DELETE** `/pinata/file/:fileId`

**Ejemplo:**
```
DELETE http://localhost:3000/pinata/file/abc123-def456
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Subir un archivo JSON con cURL

```bash
curl -X POST http://localhost:3000/pinata/upload-json \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nombre": "Proyecto Reforesta",
      "arboles": 1000,
      "ubicacion": "Sierra Nevada"
    },
    "filename": "reforesta-datos.json"
  }'
```

### Ejemplo 2: Subir un archivo con Postman

1. Abre Postman
2. Crea una nueva petición POST a `http://localhost:3000/pinata/upload`
3. En la pestaña "Body", selecciona "form-data"
4. Añade una key llamada `file` con tipo `File`
5. Selecciona tu archivo
6. Haz clic en "Send"

### Ejemplo 3: Subir un archivo desde el Frontend (JavaScript)

```javascript
// Subir un archivo
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/pinata/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('CID del archivo:', result.data.cid);
```

### Ejemplo 4: Subir JSON desde el Frontend

```javascript
const jsonData = {
  data: {
    titulo: "Mi Documento",
    contenido: "Este es el contenido del documento",
    fecha: new Date().toISOString()
  },
  filename: "documento.json"
};

const response = await fetch('http://localhost:3000/pinata/upload-json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonData)
});

const result = await response.json();
console.log('Archivo JSON subido:', result.data);
```

---

## 🎯 Subir Archivos JSON - Guía Detallada

### Opción 1: Usando el Endpoint `/upload-json` (Recomendado)

Este método es ideal cuando tienes datos en formato de objeto JavaScript y quieres convertirlos automáticamente a JSON.

**Ventajas:**
- No necesitas crear un archivo físico
- Ideal para datos generados dinámicamente
- Formateado automático del JSON

**Código de ejemplo en tu aplicación NestJS:**

```typescript
import { Injectable } from '@nestjs/common';
import { PinataService } from './pinata/pinata.service';

@Injectable()
export class MiServicio {
  constructor(private pinataService: PinataService) {}

  async guardarDatos() {
    const datos = {
      proyecto: "Reforesta",
      coordenadas: {
        lat: 40.4168,
        lng: -3.7038
      },
      arboles: [
        { especie: "Pino", cantidad: 500 },
        { especie: "Roble", cantidad: 300 }
      ]
    };

    const resultado = await this.pinataService.uploadJson(
      datos,
      'reforesta-proyecto.json'
    );

    console.log('CID:', resultado.data.cid);
    return resultado;
  }
}
```

### Opción 2: Subir un archivo JSON físico

Si ya tienes un archivo JSON en tu sistema, puedes subirlo usando el endpoint de archivos.

**Con cURL:**
```bash
curl -X POST http://localhost:3000/pinata/upload \
  -F "file=@/ruta/a/tu/archivo.json"
```

### Opción 3: Crear un controlador personalizado

Puedes crear tu propio endpoint específico para tu caso de uso:

```typescript
// src/pinata/pinata.controller.ts
@Post('subir-datos-reforesta')
async subirDatosReforesta(@Body() body: any) {
  const datosFormateados = {
    timestamp: new Date().toISOString(),
    ...body
  };

  return await this.pinataService.uploadJson(
    datosFormateados,
    `reforesta-${Date.now()}.json`
  );
}
```

---

## 🛠️ Métodos del Servicio

Si quieres usar el servicio directamente en tu código (sin pasar por los endpoints HTTP):

### Inyectar el servicio en tu módulo:

```typescript
import { Injectable } from '@nestjs/common';
import { PinataService } from './pinata/pinata.service';

@Injectable()
export class TuServicio {
  constructor(private pinataService: PinataService) {}

  async tuMetodo() {
    // Subir JSON
    const resultado = await this.pinataService.uploadJson(
      { clave: 'valor' },
      'archivo.json'
    );

    // Obtener JSON
    const datos = await this.pinataService.getJson(resultado.data.cid);

    // Listar archivos
    const archivos = await this.pinataService.listFiles();

    // Eliminar archivo
    await this.pinataService.deleteFile(resultado.data.id);
  }
}
```

---

## 📌 Notas Importantes

1. **CID vs ID**: 
   - El `cid` es el identificador de contenido en IPFS (para obtener el archivo)
   - El `id` es el identificador interno de Pinata (para operaciones como eliminar)

2. **Gateway URL**: El `GATEWAY_URL` proporcionado genera URLs pre-firmadas para la carga de archivos.

3. **Seguridad**: Nunca compartas tu `PINATA_JWT` públicamente. Añade `.env` a tu `.gitignore`.

4. **Límites**: Revisa los límites de tu plan de Pinata en [https://app.pinata.cloud](https://app.pinata.cloud)

---

## 🐛 Solución de Problemas

### Error: "PINATA_JWT no está configurado"
- Verifica que el archivo `.env` existe
- Asegúrate de que la variable `PINATA_JWT` tiene un valor
- Reinicia el servidor después de modificar `.env`

### Error al subir archivos grandes
- Verifica los límites de tu plan de Pinata
- Configura el límite de tamaño de archivos en NestJS si es necesario

### No puedo obtener el archivo con el CID
- Verifica que el CID es correcto
- Espera unos segundos después de subir (propagación en la red)
- Comprueba tu configuración de `GATEWAY_URL`

---

## 📧 Soporte

Para más información sobre Pinata:
- Documentación oficial: [https://docs.pinata.cloud](https://docs.pinata.cloud)
- Dashboard: [https://app.pinata.cloud](https://app.pinata.cloud)

---

**¡Listo!** Ya puedes usar Pinata en tu proyecto NestJS de forma organizada y profesional. 🎉
