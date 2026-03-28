# 📄 Documentación: Endpoint POST /pinata/upload-json

## 📋 Información General

Este documento detalla la implementación completa del endpoint para subir archivos JSON a IPFS usando Pinata.

---

## 🔧 Versiones de Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `pinata` | **^2.5.2** | SDK oficial de Pinata para interactuar con IPFS |
| `@nestjs/core` | **^11.0.1** | Framework principal de NestJS |
| `@nestjs/common` | **^11.0.1** | Decoradores y utilidades de NestJS |
| `@nestjs/config` | **^3.2.0** | Gestión de variables de entorno |
| `@nestjs/platform-express` | **^11.0.1** | Plataforma Express para NestJS |
| `class-validator` | **^0.14.1** | Validación de DTOs |
| `class-transformer` | **^0.5.1** | Transformación de objetos |
| `dotenv` | **^16.4.7** | Carga de variables de entorno |

---

## 📡 Detalles del Endpoint

### **Ruta**
```
POST http://localhost:3000/pinata/upload-json
```

### **Headers Requeridos**
```
Content-Type: application/json
```

### **Body de la Petición**
```json
{
  "data": {
    // Cualquier objeto JSON válido
    "nombre": "ejemplo",
    "edad": 30,
    "ciudad": "Madrid"
  },
  "filename": "usuario.json"  // Opcional, por defecto: "data.json"
}
```

### **Parámetros**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `data` | `any` | ✅ **Sí** | Objeto JSON a subir a IPFS |
| `filename` | `string` | ❌ No | Nombre del archivo (default: `data.json`) |

---

## ✅ Respuesta Exitosa (200)

```json
{
  "success": true,
  "cid": "bafkreidrjxlor jhatgeafcojozeiIltrfkzyujcs5w7bxuo2cnibomnd1",
  "name": "usuario.json",
  "size": 45,
  "ipfs_url": "ipfs://bafkreidrjxlor jhatgeafcojozeiIltrfkzyujcs5w7bxuo2cnibomnd1",
  "gateway_url": "https://gateway.pinata.cloud/ipfs/bafkreidrjxlor jhatgeafcojozeiIltrfkzyujcs5w7bxuo2cnibomnd1",
  "public_url": "https://ipfs.io/ipfs/bafkreidrjxlor jhatgeafcojozeiIltrfkzyujcs5w7bxuo2cnibomnd1",
  "access": "PUBLIC",
  "message": "JSON subido exitosamente a IPFS (acceso público para NFT)",
  "nft_ready": true
}
```

### **Campos de la Respuesta**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | `boolean` | Indica si la operación fue exitosa |
| `cid` | `string` | Content Identifier único en IPFS |
| `name` | `string` | Nombre del archivo subido |
| `size` | `number` | Tamaño del archivo en bytes |
| `ipfs_url` | `string` | URL estándar de IPFS |
| `gateway_url` | `string` | URL del gateway de Pinata |
| `public_url` | `string` | URL pública de IPFS |
| `access` | `string` | Tipo de acceso (PUBLIC) |
| `message` | `string` | Mensaje descriptivo |
| `nft_ready` | `boolean` | Indica si está listo para usar en NFTs |

---

## ❌ Respuestas de Error

### **Error 400 - Bad Request**
Cuando falta el campo `data` en el body:
```json
{
  "statusCode": 400,
  "message": "Se requiere el campo \"data\" en el body"
}
```

### **Error 500 - Internal Server Error**
Cuando hay un problema con Pinata:
```json
{
  "statusCode": 500,
  "message": "Error al subir JSON a Pinata: [detalle del error]"
}
```

---

## 🏗️ Estructura de Archivos

### **Archivos Principales**

```
src/
├── main.ts                          # Configuración principal de la app
├── pinata/
│   ├── pinata.controller.ts         # Controlador con el endpoint
│   ├── pinata.service.ts            # Lógica de negocio
│   ├── pinata.module.ts             # Módulo de Pinata
│   └── dto/
│       └── pinata.dto.ts            # DTOs para validación
```

---

## 📝 Código Importante

### **1. Controlador (pinata.controller.ts)**

```typescript
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinataService } from './pinata.service';

@Controller('pinata')
export class PinataController {
  constructor(private readonly pinataService: PinataService) {}

  /**
   * Endpoint para subir un JSON
   * POST /pinata/upload-json
   * Body: { data: any, filename?: string }
   */
  @Post('upload-json')
  async uploadJson(
    @Body() body: { data: any; filename?: string },
  ) {
    // Validación: el campo "data" es obligatorio
    if (!body.data) {
      throw new HttpException(
        'Se requiere el campo "data" en el body',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Llamar al servicio para subir el JSON
      return await this.pinataService.uploadJson(
        body.data,
        body.filename || 'data.json',
      );
    } catch (error) {
      // Manejo de errores
      throw new HttpException(
        error.message || 'Error al subir el JSON',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
```

**Responsabilidades del Controlador:**
- ✅ Recibir la petición HTTP POST
- ✅ Validar que el campo `data` existe
- ✅ Delegar la lógica al servicio
- ✅ Manejar excepciones y devolver códigos HTTP apropiados

---

### **2. Servicio (pinata.service.ts)**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';

@Injectable()
export class PinataService {
  private readonly logger = new Logger(PinataService.name);
  private pinata: PinataSDK;

  constructor(private configService: ConfigService) {
    // Obtener credenciales desde variables de entorno
    const pinataJwt = this.configService.get<string>('PINATA_JWT');
    const gatewayUrl = this.configService.get<string>('GATEWAY_URL');

    // Validar que existen las credenciales
    if (!pinataJwt) {
      throw new Error('PINATA_JWT no está configurado');
    }
    if (!gatewayUrl) {
      throw new Error('GATEWAY_URL no está configurado');
    }

    // Inicializar SDK de Pinata
    this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway: gatewayUrl,
    });

    this.logger.log('✅ Pinata SDK inicializado correctamente');
  }

  /**
   * Sube un objeto JSON como archivo a Pinata
   * @param jsonData - Objeto JSON a subir
   * @param filename - Nombre del archivo (por defecto: 'data.json')
   * @returns Información del archivo subido
   */
  async uploadJson(jsonData: any, filename: string = 'data.json') {
    try {
      this.logger.log(`Subiendo JSON como archivo: ${filename}`);

      // 🔑 PASO CLAVE: Subir JSON como PÚBLICO usando el SDK
      const upload = await this.pinata.upload.public.json(jsonData);

      // Logs informativos
      this.logger.log(`✅ JSON subido exitosamente!`);
      this.logger.log(`🔓 Accesible públicamente en IPFS`);
      this.logger.log(`📦 CID: ${upload.cid}`);
      this.logger.log(`🌐 Ver contenido: https://gateway.pinata.cloud/ipfs/${upload.cid}`);

      // Construir respuesta completa
      return {
        success: true,
        cid: upload.cid,
        name: upload.name || filename,
        size: upload.size,
        ipfs_url: `ipfs://${upload.cid}`,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${upload.cid}`,
        public_url: `https://ipfs.io/ipfs/${upload.cid}`,
        access: 'PUBLIC',
        message: 'JSON subido exitosamente a IPFS (acceso público para NFT)',
        nft_ready: true,
      };
    } catch (error) {
      this.logger.error(`Error al subir JSON: ${error.message}`, error.stack);
      throw new Error(`Error al subir JSON a Pinata: ${error.message}`);
    }
  }
}
```

**Responsabilidades del Servicio:**
- ✅ Inicializar el SDK de Pinata con credenciales
- ✅ Ejecutar `pinata.upload.public.json()` para subir el JSON
- ✅ Construir URLs de acceso (gateway, public, ipfs)
- ✅ Registrar logs detallados
- ✅ Manejar errores de Pinata

---

### **3. Configuración Principal (main.ts)**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔑 Habilitar CORS para Postman/clientes externos
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 🔑 Validación global de datos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
```

**Configuraciones Importantes:**
- ✅ **CORS habilitado**: Permite peticiones desde Postman y otros orígenes
- ✅ **ValidationPipe global**: Valida automáticamente los DTOs
- ✅ **Transform**: Transforma los datos entrantes según los DTOs

---

### **4. Variables de Entorno (.env)**

```env
# Credenciales de Pinata
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GATEWAY_URL=gateway.pinata.cloud

# Puerto de la aplicación
PORT=3000
```

**Variables Requeridas:**
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PINATA_JWT` | Token JWT de Pinata | Tu JWT desde [Pinata Dashboard](https://app.pinata.cloud/developers/api-keys) |
| `GATEWAY_URL` | URL del gateway de Pinata | `gateway.pinata.cloud` |
| `PORT` | Puerto del servidor | `3000` |

---

## 🧪 Ejemplos de Uso

### **Con cURL**
```bash
curl -X POST http://localhost:3000/pinata/upload-json \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nombre": "Juan",
      "edad": 25,
      "ciudad": "Barcelona"
    },
    "filename": "usuario.json"
  }'
```

### **Con Postman**
1. **Método:** POST
2. **URL:** `http://localhost:3000/pinata/upload-json`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw - JSON):**
```json
{
  "data": {
    "nombre": "Juan",
    "edad": 25,
    "ciudad": "Barcelona"
  },
  "filename": "usuario.json"
}
```

### **Con JavaScript/Fetch**
```javascript
fetch('http://localhost:3000/pinata/upload-json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      nombre: 'Juan',
      edad: 25,
      ciudad: 'Barcelona'
    },
    filename: 'usuario.json'
  })
})
.then(response => response.json())
.then(data => console.log('✅ JSON subido:', data))
.catch(error => console.error('❌ Error:', error));
```

---

## 🔍 Flujo de Ejecución

```
1. Cliente envía POST /pinata/upload-json
   ↓
2. PinataController.uploadJson() recibe la petición
   ↓
3. Valida que existe body.data
   ↓
4. Llama a PinataService.uploadJson(data, filename)
   ↓
5. PinataService usa SDK: pinata.upload.public.json(data)
   ↓
6. Pinata procesa y devuelve CID
   ↓
7. Servicio construye respuesta con URLs
   ↓
8. Controlador devuelve respuesta al cliente
```

---

## 🛠️ Método Clave de Pinata SDK

### **`pinata.upload.public.json()`**

Este es el método principal que hace toda la magia:

```typescript
const upload = await this.pinata.upload.public.json(jsonData);
```

**¿Qué hace?**
- ✅ Serializa el objeto JSON a string
- ✅ Sube el contenido a IPFS a través de Pinata
- ✅ Hace el archivo **público** (accesible sin autenticación)
- ✅ Devuelve el CID y metadatos

**Respuesta del SDK:**
```typescript
{
  cid: string;      // Content Identifier
  name: string;     // Nombre del archivo
  size: number;     // Tamaño en bytes
}
```

---

## 📊 Casos de Uso

### **1. Metadata de NFT**
```json
{
  "data": {
    "name": "Cool NFT #001",
    "description": "An amazing NFT",
    "image": "ipfs://bafybeih...",
    "attributes": [
      { "trait_type": "Color", "value": "Blue" }
    ]
  },
  "filename": "metadata.json"
}
```

### **2. Configuración de Aplicación**
```json
{
  "data": {
    "theme": "dark",
    "language": "es",
    "notifications": true
  },
  "filename": "config.json"
}
```

### **3. Datos de Usuario**
```json
{
  "data": {
    "userId": "123",
    "profile": {
      "name": "Ana",
      "bio": "Developer"
    }
  },
  "filename": "user-profile.json"
}
```

---

## 🚨 Troubleshooting

### **Error 400: Bad Request**
**Causa:** Falta el campo `data` en el body
**Solución:** Asegúrate de enviar `{ "data": {...} }`

### **Error 500: PINATA_JWT no configurado**
**Causa:** Variable de entorno no existe
**Solución:** Crea archivo `.env` con tu JWT

### **Error: Cannot connect to Pinata**
**Causa:** JWT inválido o expirado
**Solución:** Genera un nuevo JWT en [Pinata Dashboard](https://app.pinata.cloud/developers/api-keys)

### **Postman da error pero Thunder Client funciona**
**Causa:** Headers mal configurados en Postman
**Solución:** 
1. Body → raw → JSON (selector)
2. Headers → `Content-Type: application/json`

---

## 📚 Referencias

- **Pinata SDK:** https://docs.pinata.cloud/sdk
- **NestJS Docs:** https://docs.nestjs.com/
- **IPFS Docs:** https://docs.ipfs.tech/

---

## ✨ Características Destacadas

- 🔓 **Acceso Público:** Los archivos son accesibles sin autenticación
- 🔐 **Seguro:** Usa JWT para autenticar con Pinata
- ⚡ **Rápido:** Subida directa sin procesamiento adicional
- 🌍 **Descentralizado:** Almacenado en IPFS
- 🎯 **Ready para NFT:** Compatible con estándares de metadata

---

## 📝 Notas Finales

Este endpoint es ideal para:
- ✅ Subir metadata de NFTs
- ✅ Almacenar configuraciones
- ✅ Guardar datos de aplicaciones descentralizadas
- ✅ Crear URIs permanentes para contratos inteligentes

El JSON subido es **inmutable** y tiene un CID único que nunca cambia.

---

**Versión del documento:** 1.0  
**Fecha:** Enero 2026  hackaton
**Autor:** Sistema de Documentación Automática
