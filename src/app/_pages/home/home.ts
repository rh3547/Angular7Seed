import { Component } from '@angular/core';

import { User } from '@/_models';
import { AuthService } from '@/_services';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomeComponent {
    user: User;

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit() {
        console.log(this.authService.getCurrentUser());
    }
}