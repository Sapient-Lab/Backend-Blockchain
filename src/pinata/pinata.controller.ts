import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PinataService } from './pinata.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('pinata')
export class PinataController {
  constructor(
    private readonly pinataService: PinataService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Endpoint para subir un archivo
   * POST /pinata/upload
   * Body: archivo (form-data con key 'file')
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException(
        'No se proporcionó ningún archivo',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.pinataService.uploadFile(file);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al subir el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para subir un JSON NFT y mintear automáticamente
   * POST /pinata/upload-json
   * Body: { name, description, attributes: [{ trait_type, value }] }
   */
  @Post('upload-json')
  async uploadJson(
    @Body() body: { name: string; description: string; attributes?: { trait_type: string; value: string }[] },
  ) {
    if (!body.name || !body.description) {
      throw new HttpException(
        'Se requieren los campos "name" y "description" en el body',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Estructura NFT con imagen siempre predefinida
    const nftMetadata = {
      name: body.name,
      description: body.description,
      image: 'https://moccasin-magnetic-gopher-766.mypinata.cloud/ipfs/bafybeiagdk4wzi4pz6sbzytf6w2b5kxj6idyex5lsuzkfcu7lngo6rinjm',
      attributes: body.attributes || [],
    };

    try {
      // 1️⃣ Subir JSON a IPFS via Pinata
      const ipfsResult = await this.pinataService.uploadJson(
        nftMetadata,
        `${body.name.replace(/\s+/g, '-')}.json`,
      );

      // 2️⃣ Mintear NFT automáticamente usando el public_url como URI
      const mintResult = await this.blockchainService.safeMint(
        ipfsResult.public_url,
      );

      // 3️⃣ Construir URL del token en el explorador de Somnia
      const contractAddress = '0xE16EcfeE6067B4918AF3eAF09Dd134FFdaE92D4D';
      const explorerUrl = `https://shannon-explorer.somnia.network/token/${contractAddress}`;
      const tokenUrl =
        mintResult.tokenId !== 'N/A'
          ? `https://shannon-explorer.somnia.network/token/${contractAddress}/instance/${mintResult.tokenId}`
          : explorerUrl;

      return {
        // Datos de IPFS
        ipfs: {
          cid: ipfsResult.cid,
          public_url: ipfsResult.public_url,
          gateway_url: ipfsResult.gateway_url,
          ipfs_url: ipfsResult.ipfs_url,
        },
        // Datos del NFT minteado
        nft: {
          tokenId: mintResult.tokenId,
          transactionHash: mintResult.transactionHash,
          blockNumber: mintResult.blockNumber,
          gasUsed: mintResult.gasUsed,
          mintedTo: mintResult.to,
          uri: mintResult.uri,
        },
        // URLs del explorador
        explorer: {
          contractUrl: explorerUrl,
          tokenUrl,
          transactionUrl: `https://shannon-explorer.somnia.network/tx/${mintResult.transactionHash}`,
        },
        success: true,
        message: 'JSON subido a IPFS y NFT minteado exitosamente en Somnia Network',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al subir el JSON o mintear el NFT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para obtener un archivo por CID
   * GET /pinata/file/:cid
   */
  @Get('file/:cid')
  async getFile(@Param('cid') cid: string) {
    if (!cid) {
      throw new HttpException(
        'Se requiere el CID del archivo',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.pinataService.getFile(cid);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para obtener un JSON por CID
   * GET /pinata/json/:cid
   */
  @Get('json/:cid')
  async getJson(@Param('cid') cid: string) {
    if (!cid) {
      throw new HttpException(
        'Se requiere el CID del archivo JSON',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.pinataService.getJson(cid);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener el JSON',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para listar todos los archivos
   * GET /pinata/files
   */
  @Get('files')
  async listFiles() {
    try {
      return await this.pinataService.listFiles();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al listar los archivos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para eliminar un archivo
   * DELETE /pinata/file/:fileId
   */
  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    if (!fileId) {
      throw new HttpException(
        'Se requiere el ID del archivo',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.pinataService.deleteFile(fileId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mintea un NFT en el contrato usando wallet auto-custodia.
   * POST /pinata/mint-nft
   * Body: { uri: string }  ← usa el public_url devuelto por upload-json
   */
  @Post('mint-nft')
  async mintNft(@Body() body: { uri: string }) {
    if (!body.uri) {
      throw new HttpException(
        'Se requiere el campo "uri" en el body (usa el public_url de upload-json)',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.blockchainService.safeMint(body.uri);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al mintear el NFT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retorna la dirección y balance de la wallet auto-custodia.
   * GET /pinata/wallet
   */
  @Get('wallet')
  async getWallet() {
    try {
      const address = this.blockchainService.getWalletAddress();
      const balance = await this.blockchainService.getWalletBalance();
      return { address, ...balance };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener información de la wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
