import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PruebaEstadisticaFrecuenciasComponent } from './modules/prueba-estadistica-frecuencias/prueba-estadistica-frecuencias.component';
import { PruebaEstadisticaPromediosComponent } from './modules/prueba-estadistica-promedios/prueba-estadistica-promedios.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    PruebaEstadisticaFrecuenciasComponent,
    PruebaEstadisticaPromediosComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  seleccion = signal<string>('inicio'); //inicio, frecuencia, promedios

  onChange(seleccion: string) {
    this.seleccion.set(seleccion);
  }
}
