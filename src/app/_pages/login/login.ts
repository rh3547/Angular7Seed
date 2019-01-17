import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginComponent implements CognitoCallback, OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
	errorMessage: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        // Get the return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // Returns the fields for the login form
    get fields() { return this.loginForm.controls; }

    login() {
        this.errorMessage = "";
        this.submitted = true;

        if (this.loginForm.invalid) return;

        this.loading = true;
        this.authService.login(this.fields.email.value, this.fields.password.value, this);
    }
	
	cognitoCallback(message: string, result: any) {
		if (message != null) {
			this.errorMessage = message;
			this.loading = false;
			if (this.errorMessage === 'User is not confirmed.') {
				this.router.navigate(['/confirm', this.fields.email.value]);
			}
		} else {
			this.router.navigate([this.returnUrl]);
		}
	}
}