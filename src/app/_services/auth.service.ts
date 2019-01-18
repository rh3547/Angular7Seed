import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CognitoService, CognitoCallback } from './cognito.service';

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

    public resendCode(username: string, callback: CognitoCallback, background?: boolean) {
        this.cognitoService.resendCode(username, callback, (background) ? background : false);
    }

    public newPassword(username: string, existingPassword: string, newPassword: string, callback: CognitoCallback) {
        this.cognitoService.newPassword(username, existingPassword, newPassword, callback);
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
        let _this = this;
        let cognitoUser = this.cognitoService.getCurrentUser();

        if (cognitoUser != null) {
            return cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("UserLoginService: Couldn't get the session: " + err, err.stack);
                    _this.authenticated = false;
                }
                else {
                    console.log("UserLoginService: Session is " + session.isValid());
                    _this.authenticated = session.isValid();
                }

                return new Promise(function (resolve) { resolve(_this.authenticated); });
            });
        }
        else {
            console.log("UserLoginService: can't retrieve the current user");
            _this.authenticated = false;
            return new Promise(function (resolve) { resolve(_this.authenticated); });
        }
    }

    public retrieveIdToken() {
        return this.cognitoService.getIdToken();
    }

    public retrieveAccessToken() {
        return this.cognitoService.getAccessToken();
    }
}