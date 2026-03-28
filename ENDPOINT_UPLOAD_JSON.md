# POST /pinata/upload-json

Sube metadatos de un NFT a IPFS mediante Pinata y lo mintea automáticamente en **Somnia Network**.

---

## URL

```
POST http://localhost:3000/pinata/upload-json
```

---

## Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

---

## Body (JSON)

| Campo        | Tipo     | Requerido | Descripción                                    |
|--------------|----------|-----------|------------------------------------------------|
| `name`       | `string` | ✅ Sí     | Nombre del NFT                                 |
| `description`| `string` | ✅ Sí     | Descripción del NFT                            |
| `attributes` | `array`  | ❌ No     | Lista de atributos `{ trait_type, value }`     |

### Ejemplo de body

```json
{
  "name": "Germinación de semillas bajo condiciones de luz",
  "description": "Notas del experimento:\n\nObjetivo: Evaluar cómo la luz afecta la germinación de semillas de frijol.\n\nMateriales:\n- 20 semillas de frijol\n- 2 recipientes plásticos\n- Algodón húmedo\n- Agua destilada\n- Caja oscura\n- Fuente de luz natural\n\nProcedimiento:\n1. Colocar 10 semillas en un recipiente con algodón húmedo y mantenerlo en una caja oscura.\n2. Colocar otras 10 semillas en un recipiente similar, expuesto a la luz natural.\n3. Regar ambos recipientes con agua destilada cada 12 horas.\n4. Observar y registrar el crecimiento durante 7 días.\n\nResultados:\n- Día 2: Las semillas en ambos grupos comenzaron a hincharse.\n- Día 4: Las semillas expuestas a la luz mostraron brotes más verdes; las del grupo oscuro eran más pálidas.\n- Día 7: El grupo con luz tuvo un crecimiento promedio de 6 cm, mientras que el grupo en oscuridad alcanzó solo 3 cm.\n\nConclusión: La luz favorece un crecimiento más vigoroso y saludable en la germinación de semillas de frijol.",
  "image": "https://moccasin-magnetic-gopher-766.mypinata.cloud/ipfs/bafybeiagdk4wzi4pz6sbzytf6w2b5kxj6idyex5lsuzkfcu7lngo6rinjm",
  "attributes": [
    {
      "trait_type": "ID",
      "value": "EXP-001"
    },
    {
      "trait_type": "Usuario",
      "value": "Jhamil"
    },
    {
      "trait_type": "Creado",
      "value": "2026-03-27"
    },
    {
      "trait_type": "Publicado",
      "value": "2026-03-28"
    }
  ]
}
```

> **Nota:** La imagen siempre es una imagen predefinida almacenada en Pinata. No se puede cambiar desde el body.

---

## Flujo interno

1. Construye el JSON de metadatos NFT con `name`, `description`, la imagen predeterminada y los `attributes`.
2. Sube el JSON a IPFS via Pinata y obtiene el CID y la URL pública.
3. Mintea el NFT en Somnia Network usando la URL pública de IPFS como `tokenURI`.

---

## Respuesta exitosa `200 OK`

```json
{
  "ipfs": {
    "cid": "bafybei...",
    "public_url": "https://moccasin-magnetic-gopher-766.mypinata.cloud/ipfs/bafybei...",
    "gateway_url": "https://gateway.pinata.cloud/ipfs/bafybei...",
    "ipfs_url": "ipfs://bafybei..."
  },
  "nft": {
    "tokenId": "42",
    "transactionHash": "0xabc123...",
    "blockNumber": "1000000",
    "gasUsed": "85000",
    "mintedTo": "0xTuDirección...",
    "uri": "https://moccasin-magnetic-gopher-766.mypinata.cloud/ipfs/bafybei..."
  },
  "explorer": {
    "contractUrl": "https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D",
    "tokenUrl": "https://shannon-explorer.somnia.network/token/0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D/instance/42",
    "transactionUrl": "https://shannon-explorer.somnia.network/tx/0xabc123..."
  },
  "success": true,
  "message": "JSON subido a IPFS y NFT minteado exitosamente en Somnia Network"
}
```

---

## Errores

| Código | Causa                                                    |
|--------|----------------------------------------------------------|
| `400`  | Falta `name` o `description` en el body                 |
| `500`  | Error al subir a IPFS o al mintear el NFT en blockchain  |

### Ejemplo de error 400

```json
{
  "statusCode": 400,
  "message": "Se requieren los campos \"name\" y \"description\" en el body"
}
```

---

## Ejemplo con cURL

```bash
curl -X POST http://localhost:3000/pinata/upload-json \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi NFT #1",
    "description": "Un NFT de ejemplo",
    "attributes": [
      { "trait_type": "Color", "value": "Azul" }
    ]
  }'
```

---

## Contrato en Somnia Network

| Campo             | Valor                                          |
|-------------------|------------------------------------------------|
| Dirección         | `0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D`  |
| Red               | Somnia Shannon Testnet                         |
| Explorador        | https://shannon-explorer.somnia.network        |
