import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuardService } from './services/guards/auth-guard.service';
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canLoad: [AuthGuardService],
    canActivate: [AuthGuardService]
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
