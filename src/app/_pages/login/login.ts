import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    styleUrls: ['./login.scss']
})
export class LoginComponent implements CognitoCallback, OnInit {
    loginForm: FormGroup;
    loading = false;
    returnUrl: string;
    errorMessage: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.errorMessage = "";
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        // Get the return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.errorMessage = this.route.snapshot.queryParams['errorMessage'] || "";
    }

    // Returns the fields for the login form
    get fields() { return this.loginForm.controls; }

    login() {
        this.errorMessage = "";

        if (this.loginForm.invalid) return;

        this.loading = true;
        this.authService.login(this.fields.email.value, this.fields.password.value, this);
    }
	
	cognitoCallback(message: string, result: any) {
		if (message != null) {
			this.errorMessage = message;
            this.loading = false;

            if (this.errorMessage === CognitoService.NOT_CONFIRMED_ERROR) {
				this.router.navigate(['/confirm', { email: this.fields.email.value }]);
            }
            else if (this.errorMessage === CognitoService.CHANGE_PASSWORD_ERROR) {
                this.router.navigate(['/newPassword', { email: this.fields.email.value }]);
            }
        }
        else {
            this.router.navigate([this.returnUrl]);
            this.loading = false;
		}
    }
}