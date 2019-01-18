import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-confirm-registration',
    templateUrl: 'confirm-registration.html'
})
export class ConfirmRegistrationComponent implements CognitoCallback, OnInit, OnDestroy {
    confirmForm: FormGroup;
    private sub: any;
    email: string = undefined;
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
        this.errorMessage = "";
        this.confirmForm = this.formBuilder.group({
            email: ['', Validators.required],
            code: ['', Validators.required]
        });

        this.sub = this.route.params.subscribe(params => {
            this.email = params['email'];
            this.fields.email.setValue(params['email']);
        });

        // Get the return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    // Returns the fields for the login form
    get fields() { return this.confirmForm.controls; }

    confirmRegistration() {
        this.errorMessage = "";
        this.submitted = true;

        if (this.confirmForm.invalid) return;

        this.loading = true;
        this.authService.confirmRegistration(this.fields.email.value, this.fields.code.value, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) {
            this.errorMessage = message;
            this.loading = false;
        }
        else {
            this.router.navigate(['/home']);
        }
    }
}