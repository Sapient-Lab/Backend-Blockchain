# 📦 Módulo Pinata - NestJS

Este módulo proporciona integración completa con Pinata para almacenar archivos en IPFS dentro de tu aplicación NestJS.

## 📁 Estructura de Archivos

```
src/pinata/
├── dto/
│   └── pinata.dto.ts          # DTOs y tipos TypeScript
├── examples/
│   └── ejemplo-uso.service.ts # Ejemplos de uso del servicio
├── pinata.controller.ts        # Controlador con endpoints REST
├── pinata.controller.spec.ts   # Tests del controlador
├── pinata.module.ts            # Módulo de NestJS
├── pinata.service.ts           # Servicio con lógica de negocio
└── pinata.service.spec.ts      # Tests del servicio
```

## 🚀 Características

### Servicio (pinata.service.ts)
- ✅ `uploadFile(file)` - Sube cualquier tipo de archivo
- ✅ `uploadJson(data, filename)` - Sube objetos JSON
- ✅ `getFile(cid)` - Obtiene un archivo por CID
- ✅ `getJson(cid)` - Obtiene y parsea JSON por CID
- ✅ `listFiles()` - Lista todos los archivos
- ✅ `deleteFile(fileId)` - Elimina un archivo

### Controlador (pinata.controller.ts)
- `POST /pinata/upload` - Subir archivo (multipart/form-data)
- `POST /pinata/upload-json` - Subir JSON
- `GET /pinata/file/:cid` - Obtener archivo por CID
- `GET /pinata/json/:cid` - Obtener JSON por CID
- `GET /pinata/files` - Listar todos los archivos
- `DELETE /pinata/file/:fileId` - Eliminar archivo

## 🔧 Uso en Otros Módulos

### 1. Importar el módulo

En tu módulo personalizado:

```typescript
import { Module } from '@nestjs/common';
import { PinataModule } from '../pinata/pinata.module';
import { MiServicio } from './mi-servicio.service';

@Module({
  imports: [PinataModule],
  providers: [MiServicio],
})
export class MiModulo {}
```

### 2. Inyectar el servicio

```typescript
import { Injectable } from '@nestjs/common';
import { PinataService } from '../pinata/pinata.service';

@Injectable()
export class MiServicio {
  constructor(private pinataService: PinataService) {}

  async miMetodo() {
    // Subir JSON
    const resultado = await this.pinataService.uploadJson(
      { nombre: 'Juan', edad: 30 },
      'usuario.json'
    );

    console.log('CID:', resultado.data.cid);
    return resultado;
  }
}
```

## 📋 DTOs Disponibles

```typescript
import { UploadJsonDto, PinataResponse, PinataFileInfo } from './dto/pinata.dto';

// Para subir JSON
const jsonDto: UploadJsonDto = {
  data: { campo: 'valor' },
  filename: 'archivo.json'
};

// Tipo de respuesta
const response: PinataResponse<PinataFileInfo> = {
  success: true,
  data: {
    id: 'abc123',
    cid: 'bafybeiabc...',
    name: 'archivo.json',
    size: 1234,
    mime_type: 'application/json',
    number_of_files: 1,
    group_id: null
  },
  message: 'Archivo subido exitosamente'
};
```

## 🧪 Testing

Los archivos de test están configurados y listos para usar:

```bash
# Ejecutar tests
npm test

# Tests del servicio
npm test -- pinata.service.spec.ts

# Tests del controlador
npm test -- pinata.controller.spec.ts
```

## 📝 Ejemplos de Uso

Revisa [examples/ejemplo-uso.service.ts](./examples/ejemplo-uso.service.ts) para ver ejemplos completos de:

1. Guardar datos de proyecto como JSON
2. Recuperar datos de un proyecto
3. Guardar múltiples archivos JSON
4. Listar y filtrar archivos
5. Crear respaldos de datos
6. Actualizar datos (versioning)
7. Limpiar archivos antiguos

## 🔐 Seguridad

- Las credenciales se gestionan mediante variables de entorno
- El servicio valida la configuración al inicializarse
- Manejo de errores con logging detallado
- Validación de parámetros en el controlador

## 📊 Logging

El servicio incluye logging automático de:
- ✅ Inicialización del SDK
- ✅ Subida de archivos
- ✅ Obtención de archivos
- ✅ Listado de archivos
- ✅ Eliminación de archivos
- ❌ Errores con stack trace

## 🛠️ Configuración

Variables de entorno requeridas:
```env
PINATA_JWT=tu_jwt_aqui
GATEWAY_URL=https://pinata-server.pinata-server.workers.dev/presigned_url
```

## 📚 Documentación Adicional

Para más información y ejemplos detallados, consulta:
- [PINATA_USAGE.md](../../PINATA_USAGE.md) - Guía completa de uso
- [Documentación de Pinata](https://docs.pinata.cloud)

## 🤝 Contribuir

Para añadir nuevas funcionalidades:
1. Añade el método al servicio ([pinata.service.ts](./pinata.service.ts))
2. Añade el endpoint al controlador ([pinata.controller.ts](./pinata.controller.ts))
3. Crea tests correspondientes
4. Actualiza esta documentación

---

**Creado con ❤️ para el proyecto Reforesta**
