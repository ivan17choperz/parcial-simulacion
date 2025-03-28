import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CalculatesService } from '../../core/service/calculates.service';
import { ExcelService } from '../../core/service/excel.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prueba-estadistica-promedios',
  imports: [
    CommonModule,
    InputNumberModule,
    ButtonModule,
    ScrollPanelModule,
    FormsModule,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: `./prueba-estadistica-promendios.component.html`,
  styleUrl: './prueba-estadistica-promedios.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PruebaEstadisticaPromediosComponent implements OnInit {
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

  ngOnInit(): void {}

  async onUpload(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];

    if (!file) return;

    const data = await this.#excelService.cargarDatosDesdeCSV(file);
    console.log(this.#excelService.datosNumericos);
    if (!data) return;

    this.rowHeader = data[0];
    this.rowsContent = data.slice(1);

    console.log(this.rowsContent);
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
      testType: 'average',
      significanceLevel: this.significanceLevelInput,
      listData: this.listData,
    });
  }
}
