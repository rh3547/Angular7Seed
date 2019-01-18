import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';

import { ErrorInterceptor } from './_helpers';
import { LoginComponent } from '@/_pages/login';
import { RegisterComponent } from '@/_pages/register';
import { ConfirmRegistrationComponent } from '@/_pages/confirm-registration';
import { HomeComponent } from '@/_pages/home';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRouting
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        ConfirmRegistrationComponent,
        HomeComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }