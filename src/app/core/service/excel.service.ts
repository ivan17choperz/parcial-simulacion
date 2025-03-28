import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

interface MatrixSearchResult {
  target: number;
  values: number[];
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  private numericData: number[][] = [];

  constructor() {}

  loadFile(file: File) {}

  cargarDatosDesdeCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        delimiter: ';',
        complete: (results: any) => {
          this.numericData = this.convertirDatosANumericos(results.data);
          resolve(results.data);
        },
        error: (error) => reject(error),
      });
    });
  }

  private convertirDatosANumericos(stringMatrix: string[][]): number[][] {
    return stringMatrix
      .map(
        (row) =>
          row
            .map((cell) => {
              // Conversión robusta de números europeos/internacionales
              const cleanValue = cell.replace(/[.]/g, '').replace(',', '.');
              const num = parseFloat(cleanValue);
              return isNaN(num) ? null : num;
            })
            .filter((val) => val !== null) as number[]
      )
      .filter((row) => row.length > 0);
  }

  buscarFilaCompletaPorValor(valueToFind: number): number[] {
    if (!this.numericData || this.numericData.length === 0) {
      throw new Error('No hay datos cargados. Primero cargue un archivo.');
    }

    let filaMasCercana = this.numericData[0];
    let diferenciaMasPequena = Infinity;

    for (const fila of this.numericData) {
      for (const valor of fila) {
        const diferenciaActual = Math.abs(valor - valueToFind);
        if (diferenciaActual < diferenciaMasPequena) {
          diferenciaMasPequena = diferenciaActual;
          filaMasCercana = fila;
        }
        if (diferenciaActual === 0) break; // Coincidencia exacta
      }
      if (diferenciaMasPequena === 0) break;
    }

    return filaMasCercana;
  }

  buscarFilaCompletaConMetadata(valueToFind: number): {
    fila: number[];
    valorEncontrado: number;
    columna: number;
    diferencia: number;
  } {
    const fila = this.buscarFilaCompletaPorValor(valueToFind);
    let valorEncontrado = fila[0];
    let columna = 0;
    let diferencia = Math.abs(valorEncontrado - valueToFind);

    // Encuentra el valor más cercano dentro de la fila
    fila.forEach((valor: any, index: any) => {
      const diff = Math.abs(valor - valueToFind);
      if (diff < diferencia) {
        diferencia = diff;
        valorEncontrado = valor;
        columna = index;
      }
    });

    return {
      fila,
      valorEncontrado,
      columna,
      diferencia,
    };
  }

  buscarValorMasCercano(target: number): MatrixSearchResult {
    if (!this.numericData || this.numericData.length === 0) {
      throw new Error('Datos no cargados');
    }

    // 1. Extraer solo la columna de targets (primera columna)
    const targets = this.numericData.map((row) => row[0]);

    // 2. Encontrar el índice más cercano
    let closestIndex = 0;
    let smallestDiff = Math.abs(targets[0] - target);

    for (let i = 1; i < targets.length; i++) {
      const diff = Math.abs(targets[i] - target);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
        if (diff === 0) break; // Coincidencia exacta
      }
    }

    // 3. Devolver todos los valores de la fila (incluye el target)
    const closestRow = this.numericData[closestIndex];

    return {
      target: closestRow[0],
      values: closestRow.slice(1), // Todos los valores después del target
    };
  }

  obtenerValorAsociado(target: number, columnIndex: number): number {
    const result = this.buscarValorMasCercano(target);
    if (columnIndex < 0 || columnIndex >= result.values.length) {
      throw new Error(
        `Índice de columna inválido. Debe estar entre 0 y ${
          result.values.length - 1
        }`
      );
    }
    return result.values[columnIndex];
  }

  get datosNumericos(): number[][] {
    return this.numericData;
  }
}
