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

@Controller('pinata')
export class PinataController {
  constructor(private readonly pinataService: PinataService) {}

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
   * Endpoint para subir un JSON
   * POST /pinata/upload-json
   * Body: { data: any, filename?: string }
   */
  @Post('upload-json')
  async uploadJson(
    @Body() body: { data: any; filename?: string },
  ) {
    if (!body.data) {
      throw new HttpException(
        'Se requiere el campo "data" en el body',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.pinataService.uploadJson(
        body.data,
        body.filename || 'data.json',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al subir el JSON',
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
}
