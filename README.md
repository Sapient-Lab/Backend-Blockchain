# Backend Blockchain — Sapiens Lab

API REST construida con **NestJS** que integra almacenamiento descentralizado en **IPFS** (via Pinata) con minteo automático de NFTs en **Somnia Network** (blockchain EVM).

**Producción:** `https://backend-blockchain-sapiens-lab.vercel.app`

---

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Cómo funciona](#cómo-funciona)
- [Blockchain — Somnia Network](#blockchain--somnia-network)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints](#endpoints)
- [CORS](#cors)
- [Instalación y ejecución](#instalación-y-ejecución)

---

## Arquitectura

```
Cliente (Frontend)
       │
       ▼
  NestJS API  ──────────────────────────────────────┐
       │                                            │
       ├─► PinataService                            │
       │       └─ Pinata SDK v2                     │
       │           └─ IPFS (archivos públicos)      │
       │                                            │
       └─► BlockchainService                        │
               └─ ethers.js v6                      │
                   └─ Somnia Shannon Testnet (RPC)  │
                       └─ Contrato ERC-721          │
```

**Stack:**
- [NestJS 11](https://nestjs.com/) — framework HTTP
- [Pinata SDK 2](https://docs.pinata.cloud/) — almacenamiento IPFS
- [ethers.js 6](https://docs.ethers.org/v6/) — interacción blockchain
- [Somnia Network](https://somnia.network/) — blockchain EVM de destino

---

## Cómo funciona

### Flujo principal: mintear un NFT

Cuando se llama a `POST /pinata/upload-json`, ocurre lo siguiente en orden:

```
1. El cliente envía: { name, description, attributes[] }
         │
         ▼
2. Se construye el JSON de metadatos NFT:
   {
     name, description,
     image: "<URL fija en Pinata>",
     attributes: [...]
   }
         │
         ▼
3. PinataService sube el JSON a IPFS de forma pública
   → Devuelve CID + public_url
         │
         ▼
4. BlockchainService.safeMint(public_url)
   → Firma y envía la transacción con la wallet auto-custodia
   → Espera confirmación en la blockchain
   → Extrae el tokenId del evento Transfer
         │
         ▼
5. Se devuelve al cliente:
   {
     tokenUrl: "https://shannon-explorer.somnia.network/token/.../instance/<tokenId>",
     ipfs: { cid, public_url, gateway_url, ipfs_url },
     nft:  { tokenId, transactionHash, blockNumber, gasUsed, mintedTo, uri },
     explorer: { contractUrl, tokenUrl, transactionUrl }
   }
```

---

## Blockchain — Somnia Network

### Red
| Campo           | Valor                                                      |
|-----------------|------------------------------------------------------------|
| Nombre          | Somnia Shannon Testnet                                     |
| RPC URL         | configurado en `RPC_URL` (variable de entorno)             |
| Explorador      | https://shannon-explorer.somnia.network                    |
| Token nativo    | STT                                                        |

### Contrato NFT
| Campo           | Valor                                                      |
|-----------------|------------------------------------------------------------|
| Dirección       | `0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D`              |
| Estándar        | ERC-721                                                    |
| Función usada   | `safeMint(address to, string uri)`                         |
| Ver contrato    | https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D |

### Wallet auto-custodia
El servicio usa una wallet cuya clave privada está en la variable `PRIVATE_KEY`. Esta wallet:
- Firma todas las transacciones de minteo
- Es la destinataria (`to`) de los NFTs minteados
- Necesita tener balance de STT para pagar el gas

El `tokenId` se extrae del evento `Transfer(address from, address to, uint256 tokenId)` que emite el contrato al mintear.

### Ver un token en el explorador
```
https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D/instance/<tokenId>
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Pinata — IPFS
PINATA_JWT=tu_jwt_de_pinata
GATEWAY_URL=https://tu-gateway.mypinata.cloud

# Blockchain — Somnia Network
RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=tu_clave_privada_sin_0x
CONTRACT_ADDRESS=0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D

# Servidor
PORT=3000
```

> Obtén tu JWT en [app.pinata.cloud/developers/keys](https://app.pinata.cloud/developers/keys).

---

## Endpoints

### `POST /pinata/upload-json` ⭐ Principal
Sube metadatos a IPFS y mintea el NFT automáticamente.

**Body:**
```json
{
  "name": "Mi NFT",
  "description": "Descripción del NFT",
  "attributes": [
    { "trait_type": "Color", "value": "Azul" }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "JSON subido a IPFS y NFT minteado exitosamente en Somnia Network",
  "tokenUrl": "https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D/instance/6",
  "ipfs": {
    "cid": "bafybei...",
    "public_url": "https://ipfs.io/ipfs/bafybei...",
    "gateway_url": "https://gateway.pinata.cloud/ipfs/bafybei...",
    "ipfs_url": "ipfs://bafybei..."
  },
  "nft": {
    "tokenId": "6",
    "transactionHash": "0xabc...",
    "blockNumber": 1000000,
    "gasUsed": "85000",
    "mintedTo": "0xTuWallet...",
    "uri": "https://ipfs.io/ipfs/bafybei..."
  },
  "explorer": {
    "contractUrl": "https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D",
    "tokenUrl": "https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D/instance/6",
    "transactionUrl": "https://shannon-explorer.somnia.network/tx/0xabc..."
  }
}
```

---

### `POST /pinata/upload`
Sube un archivo binario a IPFS.

**Body:** `multipart/form-data` con campo `file`.

---

### `POST /pinata/mint-nft`
Mintea un NFT usando una URI ya existente (por ejemplo, un `public_url` previo).

**Body:**
```json
{ "uri": "https://ipfs.io/ipfs/bafybei..." }
```

---

### `GET /pinata/file/:cid`
Recupera un archivo de IPFS por su CID.

### `GET /pinata/json/:cid`
Recupera un JSON de IPFS por su CID.

### `GET /pinata/files`
Lista todos los archivos subidos a Pinata.

### `DELETE /pinata/file/:fileId`
Elimina un archivo de Pinata por su ID.

---

## CORS

La API acepta solicitudes únicamente desde los siguientes orígenes:

| Origen |
|--------|
| `https://sapientlab.vercel.app` |
| `http://localhost:3000` |
| `http://localhost:5173` |
| `https://sapient-lab-api-fkadhxgthve3hycv.eastus-01.azurewebsites.net` |

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API quedará disponible en `http://localhost:3000` (o el `PORT` que configures).

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).


Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
