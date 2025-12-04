import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/service/administradores.service';

@Component({
  selector: 'app-graficas-screens',
  templateUrl: './graficas-screens.component.html',
  styleUrls: ['./graficas-screens.component.scss']
})
export class GraficasScreensComponent implements OnInit{

  //Agregar chartjs-plugin-datalabels
  //Variables
  public total_user: any = {};

  //Histograma
  lineChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  //Dona - Doughnut
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresService: AdministradoresService
  ){
  }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresService.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Extraer los valores del objeto
        const admins = this.total_user.admins || 0;
        const maestros = this.total_user.maestros || 0;
        const alumnos = this.total_user.alumnos || 0;

        // Actualizar gráfica de línea (histograma)
        this.lineChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Registro de usuarios',
              backgroundColor: '#F88406'
            }
          ]
        };

        // Actualizar gráfica de barras
        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#82D3FB'
              ]
            }
          ]
        };

        // Crear nuevas instancias de los objetos para que Chart.js detecte los cambios
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#FCFF44',
                '#F1C8F2',
                '#31E731'
              ]
            }
          ]
        };

        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#31E7E7'
              ]
            }
          ]
        };
      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }
}
