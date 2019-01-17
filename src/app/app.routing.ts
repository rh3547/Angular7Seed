import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@/_pages/home';
import { LoginComponent } from '@/_pages/login';
import { RegisterComponent } from '@/_pages/register';
import { AuthGuard } from './_guards';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];

export const AppRouting = RouterModule.forRoot(routes);