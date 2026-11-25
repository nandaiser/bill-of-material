import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillOfMaterialComponent } from './bill-of-material.component';

const routes: Routes = [{ path: '', component: BillOfMaterialComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillOfMaterialRoutingModule {}
