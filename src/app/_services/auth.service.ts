import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CognitoService, CognitoCallback } from './cognito.service';
import { map } from 'rxjs/operators';
// import { JwtHelper } from 'angular2-jwt';

import { User } from '@/_models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authenticated: boolean = false;

    constructor(
        private http: HttpClient,
        private cognitoService: CognitoService
    ) { }

    /*
    ========================================================================================
        Login Functions
    ========================================================================================
    */
    public login(username: string, password: string, callback: CognitoCallback) {
        this.cognitoService.authenticate(username, password, callback);
    }

    public logout() {
        this.cognitoService.getCurrentUser().signOut();
    }

    /*
    ========================================================================================
        Registration Functions
    ========================================================================================
    */
    public register(name: string, username: string, password: string, callback: CognitoCallback) {
        this.cognitoService.register(name, username, password, callback);
    }

    public confirmRegistration(username: string, password: string, callback: CognitoCallback) {
        this.cognitoService.confirmRegistration(username, password, callback);
    }

    /*
    ========================================================================================
        User/Auth Functions
    ========================================================================================
    */
    public getCurrentUser() {
        return this.cognitoService.getCurrentUser();
    }

    public isAuthenticated(): Promise<boolean> {
        // Check whether the current time is past the access token's expiry time
        return this.retrieveIdToken()
            .then(token => {
                // const jwtHelper = new JwtHelper();
                // this.authenticated = token !== null && !jwtHelper.isTokenExpired(token);
                return this.authenticated;
            })
            .catch(() => {
                this.authenticated = false;
                return this.authenticated;
            });
    }

    public retrieveIdToken() {
        return this.cognitoService.getIdToken();
    }

    public retrieveAccessToken() {
        return this.cognitoService.getAccessToken();
    }
}