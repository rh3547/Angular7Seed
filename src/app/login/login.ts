import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '@/_services';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // Reset auth status
        //this.authService.logout();

        // Get the return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // Returns the fileds for the login form
    get loginFields() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) return;

        this.loading = true;
        this.authService.login(this.loginFields.username.value, this.loginFields.password.value).subscribe(
			data => {
				this.router.navigate([this.returnUrl]);
			},
			error => {
				this.error = error;
				this.loading = false;
			}
		);
    }
}
