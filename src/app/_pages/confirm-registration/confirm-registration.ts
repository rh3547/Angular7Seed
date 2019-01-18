import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-confirm-registration',
    templateUrl: 'confirm-registration.html',
    styleUrls: ['./confirm-registration.scss']
})
export class ConfirmRegistrationComponent implements CognitoCallback, OnInit, OnDestroy {
    confirmForm: FormGroup;
    private sub: any;
    email: string = undefined;
    loading = false;
    errorMessage: string;
    message: string;

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
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    // Returns the fields for the login form
    get fields() { return this.confirmForm.controls; }

    confirmRegistration() {
        this.errorMessage = "";

        if (this.confirmForm.invalid) return;

        this.loading = true;
        this.authService.confirmRegistration(this.fields.email.value, this.fields.code.value, this);
    }

    resendConfirmation() {
        if (this.email != undefined) {
            this.authService.resendCode(this.fields.email.value, this, true);
        }
        else {
            this.router.navigate(['/resendConfirmation']);
        }
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) {
            this.loading = false;

            if (message == CognitoService.CODE_SENT_MESSAGE) {
                this.message = "Your confirmation code has been re-sent. Please check your email.";
            }
            else {
                this.errorMessage = message;
            }
        }
        else {
            this.router.navigate(['/']);
        }
    }
}