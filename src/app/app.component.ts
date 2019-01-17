import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './_services';
import { User } from './_models';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html' 
})
export class AppComponent {
    currentUser: any;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}