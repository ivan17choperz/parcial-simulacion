// calculates.service.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  TestType,
  SignificanceLevel,
  CriticalValueTable,
  TestResult,
} from '../interfaces/generalModel.interface';
import { CriticalTables } from '../interfaces/generalModel.interface';
import { ExcelService } from './excel.service';

@Injectable({ providedIn: 'root' })
export class CalculatesService {
  #excelService = inject(ExcelService);

  // Configuration signals
  testType = signal<TestType | null>(null);
  dataCount = signal<number | null>(null);
  listData = signal<number[]>([]);
  significanceLevel = signal<SignificanceLevel>(0.05);
  kValue = signal<number>(0);

  resultTest = signal<TestResult | null>(null);
  readTestResult = computed(() => this.resultTest());

  public get getResultTest(): TestResult {
    return this.readTestResult() as TestResult;
  }
  public setInitialData(data: any) {
    this.testType.set(data.testType);
    this.significanceLevel.set(data.significanceLevel);
    this.listData.set(data.listData);
    this.kValue.set(data.k);
    this.dataCount.set(this.listData().length);

    this.runMainAction();
  }

  public runMainAction() {
    if (this.testType() === 'average') {
      this.runningAverageTest();
    }

    if (this.testType() === 'frequencies') {
      this.runningFrequencyTest();
    }
  }

  public runningAverageTest() {
    const x =
      this.listData().reduce((a, b) => a + b, 0) / this.listData().length;
    const sqrtN = Math.sqrt(this.listData().length);

    const u = 0.5;
    const o = Math.sqrt(1 / 12);

    const result = ((u - x) * sqrtN) / o;

    const z = Math.abs(parseFloat(Number(result).toFixed(2)));

    const data = this.#excelService.buscarFilaCompletaPorValor(
      this.calculateSignificanceLevel()
    );

    console.log(data[0], z, this.calculateSignificanceLevel());

    const isUniform = z <= data[0];
    const conclusion = isUniform
      ? 'Se acepta H₀: rᵢ ~ U(0,1) y se rechaza H₁: rᵢ no son uniformes'
      : 'Se rechaza H₀: rᵢ ~ U(0,1) y se acepta H₁: rᵢ no son uniformes';

    const response: TestResult = {
      testStatistic: z,
      criticalValue: data[0],
      conclusion,
      isUniform,
    };

    this.resultTest.set(response);
  }

  // public runningFrequencyTest() {
  //   console.log(this.kValue());

  //   const fe = this.listData().length / this.kValue();
  //   const x = [];
  //   const criticalValue = 0;
  //   for (let f = 1; f <= this.kValue(); f++) {
  //     x.push((f - fe) ** 2 / fe);
  //     const sum = x.reduce((a, b) => a + b, 0);
  //     const criticalValue = Math.abs(parseFloat(Number(sum).toFixed(2)));
  //     if (f == this.kValue()) {
  //       console.log(criticalValue);
  //     }
  //   }
  // }

  public runningFrequencyTest(): TestResult {
    // Validaciones iniciales
    if (this.kValue() <= 0) {
      throw new Error('El valor k debe ser mayor que cero');
    }
    if (this.listData().length === 0) {
      throw new Error('No hay datos disponibles para realizar la prueba');
    }

    // Calcular frecuencia esperada (fe)
    const fe = this.listData().length / this.kValue();

    // Calcular componentes chi-cuadrado
    const components: number[] = [];

    for (let f = 1; f <= this.kValue(); f++) {
      const observed = this.listData().filter((n) => {
        const intervalMin = (f - 1) / this.kValue();
        const intervalMax = f / this.kValue();
        return n >= intervalMin && n < intervalMax;
      }).length;

      components.push(Math.pow(observed - fe, 2) / fe);
    }

    // Calcular estadístico chi-cuadrado
    const chiSquare = components.reduce((sum, component) => sum + component, 0);
    const testStatistic = parseFloat(chiSquare.toFixed(4));

    // Obtener valor crítico (grados de libertad = k - 1)
    const degreesOfFreedom = this.kValue() - 1;
    const criticalValue = this.getChiSquareCriticalValue(
      degreesOfFreedom,
      this.significanceLevel()
    );

    // Determinar conclusión
    const isUniform = testStatistic <= criticalValue;
    const conclusion = isUniform
      ? 'Se acepta H₀: rᵢ ~ U(0,1) y se rechaza H₁: rᵢ no son uniformes'
      : 'Se rechaza H₀: rᵢ ~ U(0,1) y se acepta H₁: rᵢ no son uniformes';

    // Crear y devolver resultado
    const testResult: TestResult = {
      testStatistic,
      criticalValue,
      conclusion,
      isUniform,
    };

    this.resultTest.set(testResult);
    return testResult;
  }

  private getChiSquareCriticalValue(
    degreesOfFreedom: number,
    alpha: number
  ): number {
    const criticalValues = {
      1: 3.8415,
      2: 5.9915,
      3: 7.8147,
      4: 9.4877,
      5: 11.0705,
    } as { [key: number]: number };

    const lower = Math.floor(degreesOfFreedom);
    const upper = Math.ceil(degreesOfFreedom);

    if (
      criticalValues[lower] !== undefined &&
      criticalValues[upper] !== undefined
    ) {
      return lower === upper
        ? criticalValues[lower]
        : criticalValues[lower] +
            (degreesOfFreedom - lower) *
              (criticalValues[upper] - criticalValues[lower]);
    }

    throw new Error(
      `No hay valor crítico disponible para ${degreesOfFreedom} grados de libertad`
    );
  }

  public calculateSignificanceLevel() {
    return this.significanceLevel() / 2;
  }

  public resetValues() {
    this.testType.set(null);
    this.dataCount.set(null);
    this.listData.set([]);
    this.significanceLevel.set(0.05);
    this.kValue.set(0);
    this.resultTest.set(null);
  }
}
