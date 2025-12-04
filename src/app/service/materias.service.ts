import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService,
  ) { }

  public esquemaMateria() {
    return {
      nrc: '',
      nombre_materia: '',
      seccion: '',
      dias_json: [],
      hora_inicio: '',
      hora_fin: '',
      salon: '',
      programa_educativo: '',
      profesor: '',
      creditos: ''
    };
  }

  public validarMateria(data: any, editar: boolean) {

    console.log("Validando materia...", data);
    let error: any = {};

    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["nrc"])) {
      error["nrc"] = this.errorService.numeric;
    } else if (!this.validatorService.min(data["nrc"], 5)) {
      error["nrc"] = this.errorService.min(5);
    } else if (!this.validatorService.max(data["nrc"], 6)) {
      error["nrc"] = this.errorService.max(6);
    }

    // Nombre de materia
    if (!this.validatorService.required(data["nombre_materia"])) {
      error["nombre_materia"] = this.errorService.required;
    } else if (!this.validatorService.words(data["nombre_materia"])) {
      error["nombre_materia"] = this.errorService.generic;
    } else if (!this.validatorService.max(data["nombre_materia"], 100)) {
      error["nombre_materia"] = this.errorService.max(100);
    }

    // Sección
    if (!this.validatorService.required(data["seccion"])) {
      error["seccion"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["seccion"])) {
      error["seccion"] = this.errorService.numeric;
    } else if (!this.validatorService.max(data["seccion"], 3)) {
      error["seccion"] = this.errorService.max(3);
    }

    // Días
    if(!this.validatorService.required(data["dias_json"])){
      error["dias_json"] = "Debes seleccionar dias para poder registrarte";
    }

    // Horario
    const inicio24 = this.convertirHora12a24(data.hora_inicio);
    const fin24 = this.convertirHora12a24(data.hora_fin);
    if (!this.validatorService.required(data["hora_inicio"]) ||
        !this.validatorService.required(data["hora_fin"])) {

      error["horario"] = this.errorService.required;

    } else {
      // Comparación simple tipo 'HH:MM'
      if (!this.horaEnRango(inicio24) || !this.horaEnRango(fin24)) {
        error["horario"] = "Horario fuera del rango permitido (7:00 AM - 9:00 PM)";
      }
      if (this.convertirHora12a24(data.hora_inicio) >= this.convertirHora12a24(data.hora_fin)) {
        error["horario"] = "La hora final debe ser mayor a la inicial";
      }
    }

    // Salón
    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    } else if (!/^[A-Za-z0-9\s\-]+$/.test(data["salon"])) {
      error["salon"] = this.errorService.generic;
    }

    // Programa educativo
    if (!this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    // maestro asignado
    if (!this.validatorService.required(data["profesor"])) {
      error["profesor"] = this.errorService.required;
    }

    // Créditos
    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["creditos"])) {
      error["creditos"] = this.errorService.numeric;
    } else if (!this.validatorService.min(data["creditos"], 1)) {
      error["creditos"] = this.errorService.min(1);
    } else if (!this.validatorService.max(data["creditos"], 2)) {
      error["creditos"] = this.errorService.max(2);
    }

    return error;
  }

  public registrarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  public eliminarMateria(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
  }

   public obtenerListaMaterias(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

    public convertirHora12a24(hora12: string): string {
    if (!hora12) return '';

    const [time, modifier] = hora12.split(' ');

    if (!time || !modifier) return hora12;

    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }

    if (modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr}`;
  }

  public convertirHora24a12(hora24: string): string {
    if (!hora24) return '';

    let [hours, minutes] = hora24.split(':').map(Number);

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;  // Convierte 0 → 12

    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr} ${ampm}`;
  }

  public horaEnRango(hora24: string): boolean {
    if (!hora24) return false;

    const [hours, minutes] = hora24.split(':').map(Number);
    const totalMin = hours * 60 + minutes;

    const inicioMin = 7 * 60;     // 07:00 AM
    const finMin = 21 * 60;       // 09:00 PM

    return totalMin >= inicioMin && totalMin <= finMin;
  }
}
