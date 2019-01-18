import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-resend-confirmation',
    templateUrl: 'resend-confirmation.html',
    styleUrls: ['./resend-confirmation.scss']
})
export class ResendConfirmationComponent implements CognitoCallback, OnInit {
    resendForm: FormGroup;
    loading = false;
    errorMessage: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.errorMessage = "";
        this.resendForm = this.formBuilder.group({
            email: ['', Validators.required]
        });
    }

    // Returns the fields for the login form
    get fields() { return this.resendForm.controls; }

    resendConfirmation() {
        this.errorMessage = "";

        if (this.resendForm.invalid) return;

        this.loading = true;
        this.authService.resendCode(this.fields.email.value, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) {
            this.errorMessage = message;
            this.loading = false;
        }
        else {
            this.router.navigate(['/confirm', { email: this.fields.email.value }]);
        }
    }
}