import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/service/facade.service';
import { AlumnosService } from 'src/app/service/alumnos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  displayedColumns: string[] = [
    'matricula', 'nombre', 'email', 'fecha_nacimiento',
    'telefono', 'rfc', 'curp', 'ocupacion'
  ];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild('tableSortMatSort') sort?: MatSort;
  @ViewChild('tableMatPaginator') paginator?: MatPaginator;  // ← Importante para ordenar

  constructor(
    public facadeService: FacadeService,
    public AlumnosService: AlumnosService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    // Configurar sortingDataAccessor para alumnos
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nombre':
          return (item.first_name ? item.first_name : '') + ' ' + (item.last_name ? item.last_name : '');
        case 'fecha_nacimiento':
          return item.fecha_nacimiento ? new Date(item.fecha_nacimiento).getTime() : 0;
        case 'email':
          return item.email ? item.email.toLowerCase() : '';
        case 'matricula':
          return item.matricula ? item.matricula.toLowerCase() : '';
        default:
          return item[property];
      }
    };

    this.obtenerAlumnos();

    if (this.rol === 'administrador') {
      this.displayedColumns.push('editar', 'eliminar');
    }

  }



  ngAfterViewInit() {
    // Conectamos la tabla con el paginador y el sort
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        console.log("✅ Paginator asignado en alumnos");
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
        console.log("✅ Sort asignado en alumnos");
      }
    }, 0);
  }

  // Cargar lista de alumnos desde el servicio
  public obtenerAlumnos() {
    this.AlumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          // Asignamos directamente los datos sin recrear el dataSource
          this.dataSource.data = this.lista_alumnos as DatosUsuario[];

          // Asignar paginator y sort después de que los datos se carguen
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          }, 0);
        }
      },
      (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  // Filtrado
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Anuncia el cambio de orden (accesibilidad)
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Ordenado ${sortState.direction === 'asc' ? 'ascendente' : 'descendente'}`);
    } else {
      this._liveAnnouncer.announce('Orden eliminado');
    }
  }

  // Acciones
  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

 public delete(idUser: number) {
     // Administrador puede eliminar cualquier alumno
     if (this.rol === 'administrador') {
       //Si es administrador, cumple la condición, se puede eliminar
       const dialogRef = this.dialog.open(EliminarUserModalComponent,{
         data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
         height: '288px',
         width: '328px',
       });

      dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Alumno no se ha podido eliminar.");
        console.log("No se eliminó el alumno");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este alumno.");
    }
      }

}


// Fuera de la clase
export interface DatosUsuario {
  id: number;
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  curp: string;
  ocupacion: number;
}
