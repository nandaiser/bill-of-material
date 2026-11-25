import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MainConfigService } from '../../main-config.service';
import { BillOfMaterialService } from './bill-of-material.service';

@Component({
  selector: 'app-bill-of-material',
  templateUrl: './bill-of-material.component.html',
  styleUrls: ['./bill-of-material.component.css'],
})
export class BillOfMaterialComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  drawerMode: 'create' | 'edit' | 'detail' = 'create';
  selectedFormula: any = null;
  loading = false;
  submitting = false;

  searchformula = new FormGroup({
    formula_number: new FormControl(''),
    description: new FormControl(''),
  });

  formulaCreate = new FormGroup({
    description: new FormControl('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]),
    remark: new FormControl(''),
  });

  formulaList = new MatTableDataSource<any>([]);
  paginatorFormulaList = { skip: 0, limit: 10, total: 0 };
  displayedColumns = ['created_time', 'formula_number', 'description', 'remark', 'pic', 'action'];

  newProductList = new MatTableDataSource<FormGroup>([]);
  newMaterialList = new MatTableDataSource<FormGroup>([]);

  constructor(
    public mainconfig: MainConfigService,
    private formulaService: BillOfMaterialService
  ) {}

  ngOnInit(): void {
    this.getFormulaList();
  }

  get pageTo(): number {
    return Math.min(
      this.paginatorFormulaList.skip + this.paginatorFormulaList.limit,
      this.paginatorFormulaList.total
    );
  }

  get isFormValid(): boolean {
    return this.formulaCreate.valid &&
      this.newProductList.data.length > 0 &&
      this.newMaterialList.data.length > 0 &&
      this.newProductList.data.every((row) => row.valid) &&
      this.newMaterialList.data.every((row) => row.valid);
  }

  private createRow(item?: any): FormGroup {
    return new FormGroup({
      sku: new FormControl(item?.sku || '', [Validators.required, Validators.pattern(/\S/)]),
      description: new FormControl(item?.description || '', [Validators.required, Validators.pattern(/\S/)]),
      qty: new FormControl(item?.qty ?? 1, [Validators.required, Validators.min(Number.MIN_VALUE)]),
      uom: new FormControl(item?.uom || '', [Validators.required, Validators.pattern(/\S/)]),
    });
  }

  openDrawer(mode: 'create' | 'edit' | 'detail', element?: any): void {
    this.drawerMode = mode;
    this.selectedFormula = element || null;
    this.resetForm();

    if (element) {
      this.formulaCreate.patchValue({
        description: element.description,
        remark: element.remark || '',
      });
      this.newProductList.data = (element.products || []).map((item: any) => this.createRow(item));
      this.newMaterialList.data = (element.materials || []).map((item: any) => this.createRow(item));
    } else {
      this.addRow('product');
      this.addRow('material');
    }

    if (mode === 'detail') {
      this.formulaCreate.disable();
      this.newProductList.data.forEach((row) => row.disable());
      this.newMaterialList.data.forEach((row) => row.disable());
    }

    this.drawer.open();
  }

  openDetail(element: any): void {
    this.formulaService.getFormulaDetail({
      company_id: this.mainconfig.company_id,
      site: this.mainconfig.site,
      formula_number: element.formula_number,
    }).subscribe({
      next: (response) => {
        if (response.statusCode === 1) this.openDrawer('detail', response.data);
        else this.showError(response.message);
      },
      error: (error) => this.showError(this.errorMessage(error)),
    });
  }

  openEdit(element: any): void {
    this.formulaService.getFormulaDetail({
      company_id: this.mainconfig.company_id,
      site: this.mainconfig.site,
      formula_number: element.formula_number,
    }).subscribe({
      next: (response) => {
        if (response.statusCode === 1) this.openDrawer('edit', response.data);
        else this.showError(response.message);
      },
      error: (error) => this.showError(this.errorMessage(error)),
    });
  }

  closeDrawer(): void {
    this.drawer.close();
  }

  resetForm(): void {
    this.formulaCreate.enable();
    this.formulaCreate.reset({ description: '', remark: '' });
    this.newProductList.data = [];
    this.newMaterialList.data = [];
  }

  addRow(type: 'product' | 'material'): void {
    const target = type === 'product' ? this.newProductList : this.newMaterialList;
    target.data = [...target.data, this.createRow()];
  }

  removeRow(type: 'product' | 'material', index: number): void {
    const target = type === 'product' ? this.newProductList : this.newMaterialList;
    target.data = target.data.filter((_, rowIndex) => rowIndex !== index);
  }

  buildFormulaPayload(): any {
    return {
      company_id: this.mainconfig.company_id,
      site: this.mainconfig.site,
      formula_type: 0,
      description: this.formulaCreate.getRawValue().description,
      remark: this.formulaCreate.getRawValue().remark || '',
      pic: this.mainconfig.name,
      products: this.newProductList.data.map((row) => row.getRawValue()),
      materials: this.newMaterialList.data.map((row) => row.getRawValue()),
    };
  }

  async submit(): Promise<void> {
    if (!this.isFormValid || this.submitting) return;

    const action = this.drawerMode === 'create' ? 'create' : 'update';
    const confirmed = await this.mainconfig.confirmModal(
      `Are you sure you want to ${action} this formula?`
    );
    if (!confirmed) return;

    const payload = this.buildFormulaPayload();
    this.submitting = true;

    if (this.drawerMode === 'create') {
      this.createFormula(payload);
    } else if (this.drawerMode === 'edit' && this.selectedFormula) {
      this.updateFormula({
        condition: {
          company_id: this.mainconfig.company_id,
          site: this.mainconfig.site,
          formula_number: this.selectedFormula.formula_number,
        },
        update: {
          description: payload.description,
          remark: payload.remark,
          pic: payload.pic,
          products: payload.products,
          materials: payload.materials,
        },
      });
    } else {
      this.submitting = false;
    }
  }

  search(): void {
    this.paginatorFormulaList.skip = 0;
    this.getFormulaList();
  }

  resetSearch(): void {
    this.searchformula.reset({ formula_number: '', description: '' });
    this.paginatorFormulaList.skip = 0;
    this.getFormulaList();
  }

  nextPage(): void {
    if (this.paginatorFormulaList.skip + this.paginatorFormulaList.limit < this.paginatorFormulaList.total) {
      this.paginatorFormulaList.skip += this.paginatorFormulaList.limit;
      this.getFormulaList();
    }
  }

  prevPage(): void {
    this.paginatorFormulaList.skip = Math.max(0, this.paginatorFormulaList.skip - this.paginatorFormulaList.limit);
    this.getFormulaList();
  }

  getFormulaList(): void {
    this.loading = true;
    const search = this.searchformula.getRawValue();
    this.formulaService.getFormulaList({
      condition: {
        company_id: this.mainconfig.company_id,
        site: this.mainconfig.site,
        formula_number: search.formula_number || '',
        description: search.description || '',
      },
      skip: this.paginatorFormulaList.skip,
      limit: this.paginatorFormulaList.limit,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.statusCode === 1) {
          this.formulaList.data = response.data || [];
          this.paginatorFormulaList.total = response.total || 0;
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        this.showError(this.errorMessage(error));
      },
    });
  }

  createFormula(payload: any): void {
    this.formulaService.createFormula(payload).subscribe({
      next: (response) => this.handleSaveResponse(response),
      error: (error) => this.handleSaveError(error),
    });
  }

  updateFormula(payload: any): void {
    this.formulaService.updateFormula(payload).subscribe({
      next: (response) => this.handleSaveResponse(response),
      error: (error) => this.handleSaveError(error),
    });
  }

  async deleteFormula(element: any): Promise<void> {
    const confirmed = await this.mainconfig.confirmModal(
      `Delete formula ${element.formula_number}? This will soft-delete the record.`
    );
    if (!confirmed) return;

    this.formulaService.updateFormula({
      condition: {
        company_id: this.mainconfig.company_id,
        site: this.mainconfig.site,
        formula_number: element.formula_number,
      },
      update: { status: 0 },
    }).subscribe({
      next: (response) => {
        if (response.statusCode === 1) {
          this.mainconfig.showSnackBarImage({ picture: 'success', message: response.message });
          this.getFormulaList();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => this.showError(this.errorMessage(error)),
    });
  }

  private handleSaveResponse(response: any): void {
    this.submitting = false;
    if (response.statusCode === 1) {
      this.mainconfig.showSnackBarImage({ picture: 'success', message: response.message });
      this.closeDrawer();
      this.getFormulaList();
    } else {
      this.showError(response.message);
    }
  }

  private handleSaveError(error: any): void {
    this.submitting = false;
    this.showError(this.errorMessage(error));
  }

  private showError(message: any): void {
    this.mainconfig.showSnackBarImage({
      picture: 'error',
      message: message || 'Something went wrong',
    });
  }

  private errorMessage(error: any): string {
    return error?.error?.message || error?.message || 'Unable to connect to the server';
  }
}
