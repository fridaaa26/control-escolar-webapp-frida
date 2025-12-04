import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-editar-materias-modal',
  templateUrl: './editar-materias-modal.component.html',
  styleUrls: ['./editar-materias-modal.component.scss']
})
export class EditarMateriasModalComponent implements OnInit {

  public materia: string = "";
  public idMateria: number = 0;

  constructor(
    private dialogRef: MatDialogRef<EditarMateriasModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.materia = this.data.materia || "";
    this.idMateria = this.data.id || 0;
  }

  public cerrar_modal(){
    this.dialogRef.close({isEdit: false});
  }

  public editarMateria(){
    this.dialogRef.close({isEdit: true, idMateria: this.idMateria});
  }
}
