import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';

@Injectable()
export class PinataService {
  private readonly logger = new Logger(PinataService.name);
  private pinata: PinataSDK;

  constructor(private configService: ConfigService) {
    const pinataJwt = this.configService.get<string>('PINATA_JWT');
    const gatewayUrl = this.configService.get<string>('GATEWAY_URL');

    this.logger.log(`🔍 Debug - PINATA_JWT: ${pinataJwt ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    this.logger.log(`🔍 Debug - GATEWAY_URL: ${gatewayUrl ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);

    if (!pinataJwt) {
      this.logger.error('❌ PINATA_JWT no está configurado en las variables de entorno');
      this.logger.error('💡 Verifica que el archivo .env existe y contiene: PINATA_JWT=tu_jwt');
      throw new Error('PINATA_JWT no está configurado en las variables de entorno');
    }

    if (!gatewayUrl) {
      this.logger.error('❌ GATEWAY_URL no está configurado en las variables de entorno');
      throw new Error('GATEWAY_URL no está configurado en las variables de entorno');
    }

    this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway: gatewayUrl,
    });

    this.logger.log('✅ Pinata SDK inicializado correctamente');
  }

  /**
   * Sube un archivo a Pinata
   * @param file - Archivo a subir (tipo Multer File)
   * @returns Información del archivo subido incluyendo CID, ID, etc.
   */
  async uploadFile(file: any) {
    try {
      this.logger.log(`Subiendo archivo: ${file.originalname}`);

      const blob = new Blob([file.buffer], { type: file.mimetype });
      const fileToUpload = new File([blob], file.originalname, {
        type: file.mimetype,
      });

      // Subir archivo como PÚBLICO usando upload.public.file()
      const upload = await this.pinata.upload.public.file(fileToUpload);

      this.logger.log(`✅ Archivo subido exitosamente: ${upload.cid}`);
      this.logger.log(`🌐 Gateway: https://gateway.pinata.cloud/ipfs/${upload.cid}`);
      this.logger.log(`🔓 Públicamente accesible en cualquier gateway IPFS`);

      return {
        success: true,
        cid: upload.cid,
        name: upload.name,
        size: upload.size,
        ipfs_url: `ipfs://${upload.cid}`,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${upload.cid}`,
        public_url: `https://ipfs.io/ipfs/${upload.cid}`,
        access: 'PUBLIC',
        message: 'Archivo subido exitosamente a IPFS (acceso público)',
      };
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      throw new Error(`Error al subir archivo a Pinata: ${error.message}`);
    }
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

      // Subir JSON como PÚBLICO usando upload.public.json()
      const upload = await this.pinata.upload.public.json(jsonData);

      this.logger.log(`✅ JSON subido exitosamente!`);
      this.logger.log(`🔓 Accesible públicamente en IPFS`);
      this.logger.log(`📦 CID: ${upload.cid}`);
      this.logger.log(`🔗 Ver en Pinata: https://app.pinata.cloud/pinmanager`);
      this.logger.log(`🌐 Ver contenido: https://gateway.pinata.cloud/ipfs/${upload.cid}`);

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

  /**
   * Obtiene un archivo de Pinata usando su CID
   * @param cid - Content Identifier del archivo
   * @returns Datos del archivo
   */
  async getFile(cid: string) {
    try {
      this.logger.log(`Obteniendo archivo con CID: ${cid}`);

      const file = await this.pinata.gateways.public.get(cid);

      this.logger.log(`Archivo obtenido exitosamente: ${cid}`);

      return {
        success: true,
        data: file.data,
        contentType: file.contentType,
        message: 'Archivo obtenido exitosamente',
      };
    } catch (error) {
      this.logger.error(`Error al obtener archivo: ${error.message}`, error.stack);
      throw new Error(`Error al obtener archivo de Pinata: ${error.message}`);
    }
  }

  /**
   * Obtiene un JSON desde Pinata usando su CID
   * @param cid - Content Identifier del archivo JSON
   * @returns Objeto JSON parseado
   */
  async getJson(cid: string) {
    try {
      this.logger.log(`Obteniendo JSON con CID: ${cid}`);

      const file = await this.pinata.gateways.public.get(cid);
      const jsonData = JSON.parse(file.data as string);

      this.logger.log(`JSON obtenido exitosamente: ${cid}`);

      return {
        success: true,
        data: jsonData,
        message: 'JSON obtenido exitosamente',
      };
    } catch (error) {
      this.logger.error(`Error al obtener JSON: ${error.message}`, error.stack);
      throw new Error(`Error al obtener JSON de Pinata: ${error.message}`);
    }
  }

  /**
   * Lista todos los archivos subidos
   * @returns Lista de archivos
   */
  async listFiles() {
    try {
      this.logger.log('Listando archivos de Pinata');

      // TODO: Método list() no disponible en SDK 2.5.2
      // Necesita actualizarse a una versión compatible
      this.logger.warn('Método listFiles() temporalmente deshabilitado');
      
      return {
        success: false,
        data: [],
        message: 'Método no disponible en esta versión del SDK',
      };
    } catch (error) {
      this.logger.error(`Error al listar archivos: ${error.message}`, error.stack);
      throw new Error(`Error al listar archivos de Pinata: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo de Pinata
   * @param fileId - ID del archivo a eliminar
   * @returns Confirmación de eliminación
   */
  async deleteFile(fileId: string) {
    try {
      this.logger.log(`Eliminando archivo con ID: ${fileId}`);

      // TODO: Método unpin() no disponible en SDK 2.5.2
      // Necesita actualizarse a una versión compatible
      this.logger.warn('Método deleteFile() temporalmente deshabilitado');

      return {
        success: false,
        message: 'Método no disponible en esta versión del SDK',
      };
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      throw new Error(`Error al eliminar archivo de Pinata: ${error.message}`);
    }
  }
}
