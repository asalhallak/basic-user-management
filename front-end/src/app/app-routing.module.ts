import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './helpers';

/** Lazy-loads {@link AuthModule} when the user first visits `/account/*`. */
const accountModule = () => import('./auth/auth.module').then(x => x.AuthModule);
/** Lazy-loads {@link UsersModule} when the user first visits `/users/*`. */
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

/** Root route table: protected home, lazy auth/users feature areas, and a wildcard redirect. */
const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

/**
 * Registers top-level SPA routes and lazy-loads feature modules.
 *
 * @see docs/angular-routing.md
 * @see docs/front-end-modules.md
 */
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
