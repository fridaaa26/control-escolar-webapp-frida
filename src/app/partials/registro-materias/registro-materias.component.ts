import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MateriasService } from 'src/app/service/materias.service';
import { MaestrosService } from 'src/app/service/maestros.service';
import { FacadeService } from 'src/app/service/facade.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {

  public editar: boolean = false;
  public errors: any = {};
  public materia: any = {};

  public token: string = "";

  public maestros: any[] = []; // se llenará después desde el servicio correspondiente

  public dias:any[] = [
    {value: '1', nombre: 'Lunes'},
    {value: '2', nombre: 'Martes'},
    {value: '3', nombre: 'Miércoles'},
    {value: '4', nombre: 'Jueves'},
    {value: '5', nombre: 'Viernes'}
  ];

  constructor(
    private location: Location,
    private materiasService: MateriasService,
    private maestrosService:MaestrosService,
    private facadeService: FacadeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
     // Obtener token de sesión
    this.token = this.facadeService.getSessionToken();

    this.materia = this.materiasService.esquemaMateria();

    // Verificar si hay un ID en la ruta para editar
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      const idMateria = this.activatedRoute.snapshot.params['id'];
      this.obtenerMateriaParaEditar(idMateria);
    }

    this.obtenerMaestros();
  }

  public obtenerMateriaParaEditar(idMateria: number) {
    this.materiasService.obtenerMateriaPorID(idMateria).subscribe(
      (response) => {
        this.materia = response;
        console.log("Materia cargada para editar:", this.materia);

        // Si la materia tiene días como string JSON, parsear
        if (typeof this.materia.dias_json === 'string') {
          this.materia.dias_json = JSON.parse(this.materia.dias_json);
        }
      },
      (error) => {
        console.error("Error al obtener materia:", error);
        alert("No se pudo cargar la materia para editar");
        this.router.navigate(["materias"]);
      }
    );
  }

  public registrar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    console.log("Enviando materia al backend:", this.materia);

    // Si no hay errores, mandar al backend
    this.materiasService.registrarMateria(this.materia).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Materia registrada exitosamente");
        console.log("Materia registrada:", response);
        if(this.token && this.token !== ""){
            this.router.navigate(["materias"]);
          }else{
            this.router.navigate(["/"]);
          }
      },
      (error) => {
          // Manejar errores de la API
          alert("Error al registrar materia");
          console.error("Error al registrar materia: ", error);
        }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    this.materiasService.actualizarMateria(this.materia).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Materia actualizada exitosamente");
        console.log("Materia actualizada:", response);
        if(this.token && this.token !== ""){
            this.router.navigate(["materias"]);
          }else{
            this.router.navigate(["/"]);
          }
      },
      (error) => {
          // Manejar errores de la API
          alert("Error al actualizar materia");
          console.error("Error al registrar materia: ", error);
        }
    );
  }

  // Consumimos el servicio para obtener los maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        // response normalmente es un arreglo
        this.maestros = response;
        console.log("Lista de maestros: ", this.maestros);

        if (this.maestros.length > 0) {
          this.maestros.forEach(maestro => {
            maestro.first_name = maestro.user?.first_name ?? '';
            maestro.last_name = maestro.user?.last_name ?? '';
            maestro.email = maestro.user?.email ?? '';

            // Creamos nombre completo (como lo necesitas para el mat-select)
            maestro.nombre_completo = `${maestro.first_name} ${maestro.last_name}`.trim();
          });
        }

      },
      (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public goBack() {
    this.location.back();
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  public soloAlfaNumericoYEspacio(event: KeyboardEvent) {
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.materia.dias_json.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.materia.dias_json.forEach((dias, i) => {
        if(dias == event.source.value){
          this.materia.dias_json.splice(i,1)
        }
      });
    }
    console.log("Array dias: ", this.materia);
  }

  public revisarSeleccion(nombre: string){
    if(this.materia.dias_json){
      var busqueda = this.materia.dias_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

}



