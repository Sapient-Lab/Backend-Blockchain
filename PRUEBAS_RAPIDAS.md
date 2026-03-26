# 🧪 Pruebas Rápidas de Pinata

## Requisitos Previos
1. Asegúrate de tener configurado tu `.env` con `PINATA_JWT` y `GATEWAY_URL`
2. El servidor debe estar corriendo: `npm run start:dev`

---

## 🔥 Pruebas con cURL

### 1. Subir un JSON simple

```bash
curl -X POST http://localhost:3000/pinata/upload-json \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nombre": "Test Pinata",
      "fecha": "2026-01-08",
      "prueba": true
    },
    "filename": "test-pinata.json"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "abc123-def456...",
    "name": "test-pinata.json",
    "cid": "bafkreiabcd...",
    "size": 78,
    "mime_type": "application/json"
  },
  "message": "JSON subido exitosamente a Pinata"
}
```

**Guarda el CID** de la respuesta, lo necesitarás para las siguientes pruebas.

---

### 2. Obtener el JSON subido

Reemplaza `TU_CID_AQUI` con el CID que obtuviste en el paso anterior:

```bash
curl http://localhost:3000/pinata/json/TU_CID_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "nombre": "Test Pinata",
    "fecha": "2026-01-08",
    "prueba": true
  },
  "message": "JSON obtenido exitosamente"
}
```

---

### 3. Listar todos los archivos

```bash
curl http://localhost:3000/pinata/files
```

---

### 4. Subir un archivo desde tu computadora

```bash
curl -X POST http://localhost:3000/pinata/upload \
  -F "file=@/ruta/a/tu/archivo.txt"
```

---

## 🌐 Pruebas con Postman

### Subir JSON
1. **Método:** POST
2. **URL:** `http://localhost:3000/pinata/upload-json`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "data": {
    "proyecto": "Reforesta",
    "arboles": 1000,
    "ubicacion": "Madrid"
  },
  "filename": "proyecto-reforesta.json"
}
```
5. Haz clic en **Send**

### Subir Archivo
1. **Método:** POST
2. **URL:** `http://localhost:3000/pinata/upload`
3. **Body:**
   - Selecciona `form-data`
   - Key: `file` (cambia el tipo a `File`)
   - Value: Selecciona un archivo de tu computadora
4. Haz clic en **Send**

---

## 🧑‍💻 Prueba desde el código

Crea un archivo temporal `test-pinata.ts` en la carpeta `src/`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PinataService } from './pinata/pinata.service';

async function testPinata() {
  const app = await NestFactory.create(AppModule);
  const pinataService = app.get(PinataService);

  console.log('🧪 Probando Pinata...\n');

  try {
    // Test 1: Subir JSON
    console.log('1️⃣ Subiendo JSON...');
    const resultado = await pinataService.uploadJson(
      {
        nombre: 'Test desde código',
        fecha: new Date().toISOString(),
        datos: [1, 2, 3, 4, 5],
      },
      'test-codigo.json',
    );
    console.log('✅ JSON subido exitosamente');
    console.log('   CID:', resultado.data.cid);
    console.log('   ID:', resultado.data.id);

    const cid = resultado.data.cid;

    // Test 2: Obtener JSON
    console.log('\n2️⃣ Obteniendo JSON...');
    const obtenido = await pinataService.getJson(cid);
    console.log('✅ JSON obtenido:');
    console.log('   ', JSON.stringify(obtenido.data, null, 2));

    // Test 3: Listar archivos
    console.log('\n3️⃣ Listando archivos...');
    const lista = await pinataService.listFiles();
    console.log('✅ Total de archivos:', lista.data.files?.length || 0);

    console.log('\n✨ ¡Todas las pruebas pasaron exitosamente!');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }

  await app.close();
}

testPinata();
```

**Ejecutar el test:**
```bash
npx ts-node src/test-pinata.ts
```

---

## ✅ Lista de Verificación

- [ ] `.env` configurado con PINATA_JWT
- [ ] Servidor corriendo (`npm run start:dev`)
- [ ] Puedes subir JSON exitosamente
- [ ] Puedes recuperar archivos por CID
- [ ] Puedes listar archivos
- [ ] Puedes subir archivos físicos

---

## 🐛 Solución de Problemas

### Error: "PINATA_JWT no está configurado"
```bash
# Verifica que el archivo .env existe
ls .env

# Verifica el contenido
cat .env
```

### Error: "Cannot POST /pinata/upload-json"
- Asegúrate de que el servidor esté corriendo
- Verifica la URL: debe ser `http://localhost:3000/pinata/upload-json`

### Error 500: Internal Server Error
- Revisa los logs del servidor
- Verifica que tu PINATA_JWT sea válido
- Asegúrate de tener conexión a internet

---

## 📊 Ejemplo de Respuesta Completa

```json
{
  "success": true,
  "data": {
    "id": "019b9f38-39ea-714c-9686-96334f8e5b93",
    "name": "test-pinata.json",
    "cid": "bafkreih6gtjr3w5x6xvqtqsgqk2gvxe5jemzm7m3xgykvvqgvhqvqgvqgv",
    "size": 125,
    "number_of_files": 1,
    "mime_type": "application/json",
    "user_id": "be228b76-9d6e-4a73-81fa-a1d26b3f5698",
    "group_id": null,
    "created_at": "2026-01-08T23:30:00.000Z"
  },
  "message": "JSON subido exitosamente a Pinata"
}
```

---

## 🎯 Próximos Pasos

Una vez que todas las pruebas pasen:
1. Integra Pinata en tus módulos personalizados
2. Consulta [PINATA_USAGE.md](../PINATA_USAGE.md) para casos de uso avanzados
3. Revisa [src/pinata/examples/ejemplo-uso.service.ts](src/pinata/examples/ejemplo-uso.service.ts) para más ejemplos

---

¡Buena suerte con tus pruebas! 🚀
