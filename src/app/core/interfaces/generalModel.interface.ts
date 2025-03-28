// test-result.model.ts
export interface TestResult {
  testStatistic: number;
  criticalValue: number;
  degreesOfFreedom?: number;
  decision: string;
  conclusion: string;
  pValue?: number;
}

// test-config.model.ts
export type SignificanceLevel = 0.01 | 0.05 | 0.1;
export type TestType = 'average' | 'frequencies';

export interface TestConfig {
  testType: TestType | null;
  dataCount: number | null;
  alpha: SignificanceLevel;
  k?: number; // Only for frequency test
  data: number[];
}

// chi-square-table.model.ts
export interface CriticalValueTable {
  [degreesOfFreedom: number]: {
    [alpha in SignificanceLevel]: number;
  };
}

export interface CriticalTables {
  chiSquare: CriticalValueTable;
  standardNormal: CriticalValueTable;
}
