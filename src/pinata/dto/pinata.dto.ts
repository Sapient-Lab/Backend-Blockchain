import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO para subir archivos JSON
 */
export class UploadJsonDto {
  @IsNotEmpty({ message: 'El campo "data" es requerido' })
  data: any;

  @IsOptional()
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  filename?: string;
}

/**
 * DTO para obtener archivos por CID
 */
export class GetFileByCidDto {
  @IsNotEmpty({ message: 'El CID es requerido' })
  @IsString({ message: 'El CID debe ser una cadena de texto' })
  cid: string;
}

/**
 * DTO para eliminar archivos
 */
export class DeleteFileDto {
  @IsNotEmpty({ message: 'El ID del archivo es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  fileId: string;
}

/**
 * Interfaz de respuesta estándar
 */
export interface PinataResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  contentType?: string;
}

/**
 * Interfaz para información de archivo subido a Pinata
 */
export interface PinataFileInfo {
  id: string;
  name: string;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
  created_at?: string;
}
