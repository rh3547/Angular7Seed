import { Component } from '@angular/core';

import { User } from '@/_models';
import { UserService, AuthService } from '@/_services';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomeComponent {
    users: User[] = [];

    constructor(
        private userService: UserService
    ) { }

    ngOnInit() {
        this.userService.getAll().subscribe(
            users => {
                this.users = users;
            }
        );
    }
}