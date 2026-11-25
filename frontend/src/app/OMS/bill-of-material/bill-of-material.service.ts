import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MainConfigService } from '../../main-config.service';

@Injectable({ providedIn: 'root' })
export class BillOfMaterialService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private mainconfig: MainConfigService) {}

  createFormula(data: any): Observable<any> {
    return this.http.post(
      `${this.mainconfig.API_URL}/core/bill-of-material/create-formula`,
      data,
      this.httpOptions
    );
  }

  getFormulaList(data: any): Observable<any> {
    return this.http.post(
      `${this.mainconfig.API_URL}/core/bill-of-material/get-formula-list`,
      data,
      this.httpOptions
    );
  }

  getFormulaDetail(data: any): Observable<any> {
    return this.http.post(
      `${this.mainconfig.API_URL}/core/bill-of-material/get-formula-detail`,
      data,
      this.httpOptions
    );
  }

  updateFormula(data: any): Observable<any> {
    return this.http.post(
      `${this.mainconfig.API_URL}/core/bill-of-material/update-formula`,
      data,
      this.httpOptions
    );
  }
}
