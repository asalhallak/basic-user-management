import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';

const routes: Routes = [
  { path: 'auth',  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '', component: AppComponent, canActivate: [] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
