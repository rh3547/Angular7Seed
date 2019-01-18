import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@/_pages/home';
import { LoginComponent } from '@/_pages/login';
import { RegisterComponent } from '@/_pages/register';
import { ConfirmRegistrationComponent } from '@/_pages/confirm-registration';
import { ResendConfirmationComponent } from '@/_pages/resend-confirmation';
import { NewPasswordComponent } from '@/_pages/new-password';
import { AuthGuard } from './_guards';

const routes: Routes = [

    // Public Routes
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'confirm',
        component: ConfirmRegistrationComponent
    },
    {
        path: 'resendConfirmation',
        component: ResendConfirmationComponent
    },
    {
        path: 'newPassword',
        component: NewPasswordComponent
    },

    // Guarded Routes
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },

    // Else Redirect
    {
        path: '**',
        redirectTo: ''
    }
];

export const AppRouting = RouterModule.forRoot(routes);