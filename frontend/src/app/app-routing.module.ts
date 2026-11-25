import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'OMS/bill-of-material', pathMatch: 'full' },
  {
    path: 'OMS/bill-of-material',
    loadChildren: () => import('./OMS/bill-of-material/bill-of-material.module').then((m) => m.BillOfMaterialModule),
  },
  { path: '**', redirectTo: 'OMS/bill-of-material' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
