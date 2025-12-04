import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/service/facade.service';
import { MateriasService } from 'src/app/service/materias.service';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EditarMateriasModalComponent } from 'src/app/modals/editar-materias-modal/editar-materias-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  displayedColumns: string[] = [
    'nrc',
    'nombre_materia',
    'seccion',
    'programa_educativo',
    'creditos',
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild('tableSortMatSort') sort?: MatSort;
  @ViewChild('tableMatPaginator') paginator?: MatPaginator;

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (!this.token) {
      this.router.navigate(['/']);
    }

    // Configurar sortingDataAccessor para materias
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'nrc':
          return item.nrc ? parseInt(item.nrc) : 0;
        case 'nombre_materia':
          return item.nombre_materia ? item.nombre_materia.toLowerCase() : '';
        case 'seccion':
          return item.seccion ? parseInt(item.seccion) : 0;
        case 'programa_educativo':
          return item.programa_educativo ? item.programa_educativo.toLowerCase() : '';
        case 'creditos':
          return item.creditos ? parseInt(item.creditos) : 0;
        default:
          return item[property];
      }
    };

    this.obtenerMaterias();

    if (this.rol === 'administrador') {
      this.displayedColumns.push('editar', 'eliminar');
    }
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit ejecutado");
    console.log("Paginator:", this.paginator);
    console.log("Sort:", this.sort);

    // Asignar después de que la vista esté completamente lista
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }, 0);
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;

        console.log("Materias obtenidas:", response);

        this.dataSource.data = this.lista_materias;

        // Asignar paginator y sort después de que los datos se carguen
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        }, 0);
      },
      (error) => {
        console.error("Error al obtener materias:", error);
        alert("No se pudieron cargar las materias");
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Ordenado ${sortState.direction}`);
    } else {
      this._liveAnnouncer.announce('Orden eliminado');
    }
  }

  public goEditar(idMateria: number) {
    const dialogRef = this.dialog.open(EditarMateriasModalComponent, {
      data: { id: idMateria },
      height: '260px',
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isEdit) {
        this.router.navigate(["registro-materias", result.idMateria]);
      }
    });
  }

  // ELIMINAR
  public delete(idMateria: number) {

    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idMateria, rol: 'materia' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.isDelete) {
          console.log("Materia eliminada");
          alert("Materia eliminada correctamente.");
          window.location.reload();
        } else {
          alert("Materia no se ha podido eliminar.");
          console.log("No se eliminó la materia");
        }
      });
    } else {
      alert("No tienes permisos para eliminar esta materia.");
    }
  }
}
