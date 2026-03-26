import { Injectable } from '@nestjs/common';
import { PinataService } from '../pinata.service';
import { PinataFileInfo } from '../dto/pinata.dto';

/**
 * Ejemplo de servicio que usa PinataService
 * Este archivo muestra cómo integrar Pinata en tus propios servicios
 */
@Injectable()
export class EjemploUsoService {
  constructor(private readonly pinataService: PinataService) {}

  /**
   * Ejemplo 1: Guardar datos de proyecto como JSON
   */
  async guardarProyecto() {
    const datosProyecto = {
      nombre: 'Reforesta 2026',
      ubicacion: {
        ciudad: 'Madrid',
        coordenadas: {
          lat: 40.4168,
          lng: -3.7038,
        },
      },
      arboles: [
        { especie: 'Pino', cantidad: 500, fecha: '2026-01-08' },
        { especie: 'Roble', cantidad: 300, fecha: '2026-01-10' },
      ],
      presupuesto: 50000,
      estado: 'activo',
    };

    try {
      const resultado = await this.pinataService.uploadJson(
        datosProyecto,
        'proyecto-reforesta.json',
      );

      console.log('✅ Proyecto guardado en IPFS');
      console.log('CID:', resultado.cid);
      console.log('URL IPFS:', resultado.ipfs_url);
      console.log('Gateway:', resultado.gateway_url);

      return resultado;
    } catch (error) {
      console.error('❌ Error al guardar proyecto:', error.message);
      throw error;
    }
  }

  /**
   * Ejemplo 2: Recuperar datos de un proyecto
   */
  async obtenerProyecto(cid: string) {
    try {
      const resultado = await this.pinataService.getJson(cid);
      console.log('✅ Proyecto recuperado:', resultado.data);
      return resultado.data;
    } catch (error) {
      console.error('❌ Error al recuperar proyecto:', error.message);
      throw error;
    }
  }

  /**
   * Ejemplo 3: Guardar múltiples archivos JSON
   */
  async guardarLoteDatos() {
    const datos = [
      { tipo: 'sensor', temperatura: 22, humedad: 65 },
      { tipo: 'sensor', temperatura: 23, humedad: 62 },
      { tipo: 'sensor', temperatura: 21, humedad: 68 },
    ];

    const resultados: Array<{ index: number; cid: string }> = [];

    for (let i = 0; i < datos.length; i++) {
      const resultado = await this.pinataService.uploadJson(
        datos[i],
        `sensor-${i + 1}.json`,
      );
      resultados.push({
        index: i + 1,
        cid: resultado.cid,
        ipfs_url: resultado.ipfs_url,
        gateway_url: resultado.gateway_url,
      } as any);
    }

    console.log('✅ Lote de datos guardado');
    return resultados;
  }

  /**
   * Ejemplo 4: Listar todos los archivos y filtrar por tipo
   */
  async listarArchivosJSON() {
    try {
      const resultado = await this.pinataService.listFiles();
      
      // Filtrar solo archivos JSON
      const archivosJson = (resultado.data as PinataFileInfo[])?.filter(
        (f) => f.mime_type === 'application/json',
      ) || [];

      console.log('✅ Archivos JSON encontrados:', archivosJson?.length || 0);
      return archivosJson;
    } catch (error) {
      console.error('❌ Error al listar archivos:', error.message);
      throw error;
    }
  }

  /**
   * Ejemplo 5: Crear respaldo de datos
   */
  async crearRespaldo() {
    const timestamp = new Date().toISOString();
    
    const respaldo = {
      fecha_respaldo: timestamp,
      version: '1.0.0',
      datos: {
        // Aquí irían tus datos a respaldar
        configuracion: {},
        usuarios: [],
        proyectos: [],
      },
    };

    const resultado = await this.pinataService.uploadJson(
      respaldo,
      `respaldo-${timestamp}.json`,
    );

    console.log('✅ Respaldo creado con CID:', resultado.cid);
    console.log('🔗 URL IPFS:', resultado.ipfs_url);
    return resultado;
  }

  /**
   * Ejemplo 6: Actualizar datos (crear nueva versión)
   */
  async actualizarDatos(cidAnterior: string, nuevosDatos: any) {
    // 1. Obtener datos anteriores
    const datosAnteriores = await this.pinataService.getJson(cidAnterior);

    // 2. Combinar con nuevos datos
    const datosActualizados = {
      ...datosAnteriores.data,
      ...nuevosDatos,
      actualizado_en: new Date().toISOString(),
      version_anterior: cidAnterior,
    };

    // 3. Subir nueva versión
    const resultado = await this.pinataService.uploadJson(
      datosActualizados,
      'datos-actualizados.json',
    );

    console.log('✅ Datos actualizados. Nuevo CID:', resultado.cid);
    console.log('🔗 URL IPFS:', resultado.ipfs_url);
    return resultado;
  }

  /**
   * Ejemplo 7: Limpiar archivos antiguos
   */
  async limpiarArchivosAntiguos(diasAntiguedad: number = 30) {
    const resultado = await this.pinataService.listFiles();
    const archivos = (resultado.data as PinataFileInfo[]) || [];
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    let eliminados = 0;

    for (const archivo of archivos) {
      const fechaCreacion = new Date(archivo.created_at || '');
      
      if (fechaCreacion < fechaLimite) {
        await this.pinataService.deleteFile(archivo.id);
        eliminados++;
        console.log(`🗑️ Eliminado: ${archivo.name} (${archivo.id})`);
      }
    }

    console.log(`✅ Limpieza completada. ${eliminados} archivos eliminados.`);
    return { eliminados };
  }
}
