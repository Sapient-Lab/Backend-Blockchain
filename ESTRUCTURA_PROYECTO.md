# 🗂️ Estructura del Proyecto - Pinata + NestJS

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (Frontend)                    │
│                 (cURL, Postman, Browser)                 │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP Requests
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  NestJS Application                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │           app.module.ts (Root Module)             │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         ConfigModule (Global)               │  │  │
│  │  │    - Carga variables de entorno             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │          PinataModule                       │  │  │
│  │  │                                              │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │    PinataController                  │  │  │  │
│  │  │  │  - POST /pinata/upload               │  │  │  │
│  │  │  │  - POST /pinata/upload-json          │  │  │  │
│  │  │  │  - GET  /pinata/file/:cid            │  │  │  │
│  │  │  │  - GET  /pinata/json/:cid            │  │  │  │
│  │  │  │  - GET  /pinata/files                │  │  │  │
│  │  │  │  - DELETE /pinata/file/:fileId       │  │  │  │
│  │  │  └──────────────┬───────────────────────┘  │  │  │
│  │  │                 │                           │  │  │
│  │  │  ┌──────────────▼───────────────────────┐  │  │  │
│  │  │  │    PinataService                     │  │  │  │
│  │  │  │  - uploadFile()                      │  │  │  │
│  │  │  │  - uploadJson()                      │  │  │  │
│  │  │  │  - getFile()                         │  │  │  │
│  │  │  │  - getJson()                         │  │  │  │
│  │  │  │  - listFiles()                       │  │  │  │
│  │  │  │  - deleteFile()                      │  │  │  │
│  │  │  └──────────────┬───────────────────────┘  │  │  │
│  │  │                 │                           │  │  │
│  │  └─────────────────┼───────────────────────────┘  │  │
│  └────────────────────┼──────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │ Pinata SDK
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     Pinata API                           │
│                        (IPFS)                            │
│  - Almacenamiento descentralizado                        │
│  - Gateway para acceso a archivos                        │
│  - Gestión de archivos subidos                           │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
c:\Reforesta\prueba pinata\pinata\
│
├── 📄 .env                          # Variables de entorno (no versionado)
├── 📄 .env.example                  # Ejemplo de variables de entorno
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 nest-cli.json                 # Configuración de NestJS CLI
│
├── 📚 README.md                     # Documentación principal
├── 📚 PINATA_USAGE.md               # Guía completa de uso de Pinata
├── 📚 PRUEBAS_RAPIDAS.md            # Guía de pruebas rápidas
│
└── src/
    │
    ├── 📄 main.ts                   # Punto de entrada de la aplicación
    ├── 📄 app.module.ts             # Módulo raíz (importa PinataModule)
    ├── 📄 app.controller.ts         # Controlador principal
    ├── 📄 app.service.ts            # Servicio principal
    │
    ├── 📂 pinata/                   # 🎯 Módulo de Pinata (organizado)
    │   │
    │   ├── 📄 README.md             # Documentación del módulo
    │   ├── 📄 pinata.module.ts      # Módulo de Pinata
    │   ├── 📄 pinata.controller.ts  # Controlador REST de Pinata
    │   ├── 📄 pinata.service.ts     # Servicio con lógica de negocio
    │   ├── 📄 pinata.controller.spec.ts  # Tests del controlador
    │   ├── 📄 pinata.service.spec.ts     # Tests del servicio
    │   │
    │   ├── 📂 dto/
    │   │   └── 📄 pinata.dto.ts     # DTOs y tipos TypeScript
    │   │
    │   └── 📂 examples/
    │       └── 📄 ejemplo-uso.service.ts  # Ejemplos de uso
    │
    └── 📂 types/
        └── 📄 express.d.ts          # Tipos TypeScript globales
```

## 🔄 Flujo de Datos

### 1️⃣ Subir un Archivo JSON

```
Cliente                Controller              Service               Pinata API
  │                        │                      │                      │
  │  POST /upload-json     │                      │                      │
  ├───────────────────────>│                      │                      │
  │  Body: {data, filename}│                      │                      │
  │                        │  uploadJson()        │                      │
  │                        ├─────────────────────>│                      │
  │                        │                      │  SDK.upload.file()   │
  │                        │                      ├─────────────────────>│
  │                        │                      │                      │
  │                        │                      │  {cid, id, size...}  │
  │                        │                      │<─────────────────────┤
  │                        │  {success, data...}  │                      │
  │                        │<─────────────────────┤                      │
  │  Response: {success...}│                      │                      │
  │<───────────────────────┤                      │                      │
  │                        │                      │                      │
```

### 2️⃣ Obtener un Archivo por CID

```
Cliente                Controller              Service               Pinata API
  │                        │                      │                      │
  │  GET /json/:cid        │                      │                      │
  ├───────────────────────>│                      │                      │
  │                        │  getJson(cid)        │                      │
  │                        ├─────────────────────>│                      │
  │                        │                      │  SDK.gateways.get()  │
  │                        │                      ├─────────────────────>│
  │                        │                      │                      │
  │                        │                      │  Archivo JSON        │
  │                        │                      │<─────────────────────┤
  │                        │  {success, data...}  │                      │
  │                        │<─────────────────────┤                      │
  │  Response: JSON Data   │                      │                      │
  │<───────────────────────┤                      │                      │
  │                        │                      │                      │
```

## 🔧 Dependencias Principales

```json
{
  "pinata": "^1.3.2",              // SDK oficial de Pinata
  "@nestjs/common": "^11.0.1",     // Core de NestJS
  "@nestjs/config": "^3.2.0",      // Gestión de configuración
  "@nestjs/platform-express": "^11.0.1",  // Plataforma Express
  "class-validator": "^0.14.1",    // Validación de DTOs
  "dotenv": "^16.4.7"              // Variables de entorno
}
```

## 🌐 Endpoints Disponibles

| Método   | Endpoint                   | Descripción                      |
|----------|----------------------------|----------------------------------|
| POST     | `/pinata/upload`           | Subir archivo (multipart)        |
| POST     | `/pinata/upload-json`      | Subir JSON                       |
| GET      | `/pinata/file/:cid`        | Obtener archivo por CID          |
| GET      | `/pinata/json/:cid`        | Obtener JSON parseado por CID    |
| GET      | `/pinata/files`            | Listar todos los archivos        |
| DELETE   | `/pinata/file/:fileId`     | Eliminar archivo por ID          |

## 🔐 Variables de Entorno

```env
# JWT de Pinata (obligatorio)
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gateway URL de Pinata (obligatorio)
GATEWAY_URL=https://pinata-server.pinata-server.workers.dev/presigned_url
```

## 📦 Exports del Módulo

El `PinataModule` exporta `PinataService`, lo que permite usarlo en otros módulos:

```typescript
// En cualquier módulo
import { PinataModule } from './pinata/pinata.module';

@Module({
  imports: [PinataModule],  // Importar el módulo
  // ...
})
export class MiModulo {}

// En cualquier servicio del módulo
import { PinataService } from './pinata/pinata.service';

@Injectable()
export class MiServicio {
  constructor(private pinataService: PinataService) {}
  // Ahora puedes usar this.pinataService
}
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Test específico del módulo Pinata
npm test -- --testPathPattern=pinata

# Tests con cobertura
npm run test:cov
```

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run start:dev        # Inicia con hot-reload

# Producción
npm run build           # Compila el proyecto
npm run start:prod      # Inicia en modo producción

# Linting y Formateo
npm run lint            # Ejecuta ESLint
npm run format          # Formatea el código
```

## 📝 Notas de Diseño

1. **Separación de Responsabilidades**
   - Controller: Maneja HTTP y validación
   - Service: Lógica de negocio e interacción con Pinata
   - DTOs: Validación de datos de entrada

2. **Módulo Independiente**
   - Todo el código de Pinata está en `src/pinata/`
   - Puede ser reutilizado en otros proyectos
   - Fácil de mantener y testear

3. **Configuración Centralizada**
   - Variables de entorno gestionadas por ConfigModule
   - Validación al inicializar el servicio

4. **Logging Integrado**
   - Todos los eventos importantes se registran
   - Facilita el debugging y monitoreo

---

**Última actualización:** 8 de enero de 2026
