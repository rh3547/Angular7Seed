import { Component } from '@angular/core';
import { Router, ResolveStart } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

import { AuthService } from './_services';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    isAuthenticated: boolean;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        router.events.subscribe((val) => {
            if (val instanceof ResolveStart) {
                if (val.url == "/login") {
                    this.checkAuth();
                }
                else if (val.url == "/") {
                    this.checkAuth();
                }
            }
        });
    }

    checkAuth() {
        this.authService.isAuthenticated()
            .then(authenticated => {
                if (authenticated) {
                    this.isAuthenticated = true;
                }
                else {
                    this.isAuthenticated = false;
                }
            });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}