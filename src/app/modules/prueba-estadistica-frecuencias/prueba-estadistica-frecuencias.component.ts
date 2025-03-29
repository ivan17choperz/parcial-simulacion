import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { ExcelService } from '../../core/service/excel.service';
import { CalculatesService } from '../../core/service/calculates.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prueba-estadistica-frecuencias',
  imports: [
    CommonModule,
    InputNumberModule,
    ButtonModule,
    ScrollPanelModule,
    FormsModule,
    SelectModule,
  ],
  templateUrl: `./prueba-estadistica-fecuencias.component.html`,
  styleUrl: './prueba-estadistica-frecuencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PruebaEstadisticaFrecuenciasComponent implements OnInit {
  #excelService = inject(ExcelService);
  #calculatesService = inject(CalculatesService);

  listFiles: any[] = [];
  listData: number[] = [];
  significanceLevel = [
    {
      label: '1%',
      value: 0.01,
    },
    {
      label: '5%',
      value: 0.05,
    },
    {
      label: '10%',
      value: 0.1,
    },
  ];
  // table
  rowHeader: any[] = [];
  rowsContent: any[] = [];

  numberInput = 0;
  significanceLevelInput = 0;
  kValue = 0;
  resultTest = this.#calculatesService.readTestResult;

  ngOnInit(): void {}

  async onUpload(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];

    if (!file) return;

    const data = await this.#excelService.cargarDatosDesdeCSV(file);
    if (!data) return;

    this.rowHeader = data[0];
    this.rowsContent = data.slice(1);
  }

  addDataIntoList() {
    const number = parseFloat(Number(this.numberInput).toFixed(2));
    if (!number || number === 0) return;
    this.listData.push(number);
    this.numberInput = 0;
  }

  onSubmit() {
    if (this.listData.length === 0) return;
    if (this.significanceLevelInput === 0) return;

    this.#calculatesService.setInitialData({
      testType: 'frequencies',
      significanceLevel: this.significanceLevelInput,
      listData: this.listData,
      k: this.kValue,
    });
  }

  reset() {
    this.#excelService.reset();
    this.listData = [];
    this.significanceLevelInput = 0;
    this.numberInput = 0;
    this.kValue = 0;
    this.#calculatesService.resetValues();
  }
}
