import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/service/facade.service';
import { MaestrosService } from 'src/app/service/maestros.service';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion'];

  // Inicializamos dataSource sin datos, luego asignamos data
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  // Usar non-null assertion para evitar errores con strictTypes
  @ViewChild('tableSortMatSort') sort?: MatSort;
  @ViewChild('tableMatPaginator') paginator?: MatPaginator;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    if (this.token === "") {
      this.router.navigate(["/"]);
    }
    this.obtenerMaestros();

    if (this.rol === 'administrador') {
      this.displayedColumns.push('editar', 'eliminar');
    }

    // Configuramos cómo se ordenan columnas especiales (nombre concatenado y fecha)
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nombre':
          // devolver una sola cadena para ordenar por nombre completo
          return (item.first_name ? item.first_name : '') + ' ' + (item.last_name ? item.last_name : '');
        case 'fecha_nacimiento':
          // convertir a timestamp para ordenar correctamente por fecha
          // si la fecha viene como 'yyyy-mm-dd' o ISO, Date funciona bien
          return item.fecha_nacimiento ? new Date(item.fecha_nacimiento).getTime() : 0;
        case 'id_trabajador':
          return item.id_trabajador;
        case 'email':
          return item.email ? item.email.toLowerCase() : '';
        // agrega más casos si necesitas orden personalizado
        default:
          // por defecto, devuelve la propiedad tal cual (string/number)
          return item[property];
      }
    };
  }

  ngAfterViewInit() {
    // Aseguramos que el paginator y el sort quedan enlazados al dataSource actual
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }, 0);
  }

  // Consumimos el servicio para obtener los maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          // agregamos las propiedades de usuario para facilitar el template
          this.lista_maestros.forEach(usuario => {
            usuario.first_name = usuario.user?.first_name ?? '';
            usuario.last_name = usuario.user?.last_name ?? '';
            usuario.email = usuario.user?.email ?? '';
          });
          this.dataSource.data = this.lista_maestros as DatosUsuario[];

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
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/maestro/" + idUser]);
  }

  public delete(idUser: number) {

    // Administrador puede eliminar cualquier maestro
    if (this.rol === 'administrador' ) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'maestro'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este maestro.");
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Método para anunciar cambios de orden (accesibilidad)
 announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Ordenado ${sortState.direction}`);
    } else {
      this._liveAnnouncer.announce('Orden eliminado');
    }
  }
}

// Interfaz fuera de la clase
export interface DatosUsuario {
  id: number;
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  cubiculo: string;
  area_investigacion: number;
}
