import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login/login.component';
import {AuthRoutingModule} from "./auth-routing.module";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AuthRoutingModule
    ],
    declarations: [
        LayoutComponent,
        LoginComponent
    ]
})
export class AuthModule { }
