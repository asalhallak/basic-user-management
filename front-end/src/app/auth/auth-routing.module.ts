import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

/** Child routes under `/account`: login and register forms inside the auth layout shell. */
const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]
    }
];

/**
 * Feature routing for {@link AuthModule} (`/account/login`, `/account/register`).
 *
 * @see docs/angular-routing.md
 * @see docs/front-end-login-register.md
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
