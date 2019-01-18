import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService, CognitoCallback } from '@/_services';

@Component({
    selector: 'page-new-password',
    templateUrl: 'new-password.html',
    styleUrls: ['./new-password.scss']
})
export class NewPasswordComponent implements CognitoCallback, OnInit, OnDestroy {
    newPasswordForm: FormGroup;
    loading = false;
    errorMessage: string;
    private sub: any;
    email: string = undefined;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.errorMessage = "";
        this.newPasswordForm = this.formBuilder.group({
            email: ['', Validators.required],
            existingPassword: ['', Validators.required],
            newPassword: ['', Validators.required]
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
    get fields() { return this.newPasswordForm.controls; }

    newPassword() {
        this.errorMessage = "";

        if (this.newPasswordForm.invalid) return;

        this.loading = true;
        this.authService.newPassword(this.fields.email.value, this.fields.existingPassword.value, this.fields.newPassword.value, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) {
            this.errorMessage = message;
            this.loading = false;
        }
        else {
            this.router.navigate(['/']);
        }
    }
}