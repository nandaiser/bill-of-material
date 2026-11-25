import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { BillOfMaterialRoutingModule } from './bill-of-material-routing.module';
import { BillOfMaterialComponent } from './bill-of-material.component';

@NgModule({
  declarations: [BillOfMaterialComponent],
  imports: [CommonModule, ReactiveFormsModule, BillOfMaterialRoutingModule, MaterialModule],
})
export class BillOfMaterialModule {}
