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

  public runningFrequencyTest() {
    console.log(this.kValue());

    const fe = this.listData().length / this.kValue();
    const x = [];
    const criticalValue = 0;
    for (let f = 1; f <= this.kValue(); f++) {
      x.push((f - fe) ** 2 / fe);
      const sum = x.reduce((a, b) => a + b, 0);
      const criticalValue = Math.abs(parseFloat(Number(sum).toFixed(2)));
      console.log(criticalValue);
    }
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
