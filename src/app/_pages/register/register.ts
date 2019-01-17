import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-register',
    templateUrl: 'register.html'
})
export class RegisterComponent implements CognitoCallback, OnInit {
    registerForm: FormGroup;
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
        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        // Get the return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // Returns the fields for the login form
    get fields() { return this.registerForm.controls; }

    register() {
        this.errorMessage = "";
        this.submitted = true;

        if (this.registerForm.invalid) return;

        this.loading = true;
        this.authService.register(this.fields.name.value, this.fields.email.value, this.fields.password.value, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) {
            this.errorMessage = message;
            this.loading = false;
        }
        else {
            this.router.navigate(['/confirm', result.user.username]);
        }
    }
}