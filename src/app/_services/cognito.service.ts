import { Injectable, Inject } from "@angular/core";
import { Environment } from "@/environments/environment";
import * as AWS from 'aws-sdk';
import * as AWSCognito from 'amazon-cognito-identity-js';

// declare let AWSCognito: any;

export interface CognitoCallback {
    cognitoCallback(message: string, result: any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message: string, loggedIn: boolean): void;
}

export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

@Injectable({
    providedIn: 'root'
})
export class CognitoService {
    public static NOT_CONFIRMED_ERROR: string = "User is not confirmed.";
    public static CHANGE_PASSWORD_ERROR: string = "User must change password.";
    public static CODE_SENT_MESSAGE: string = "Code sent.";

    public static _POOL_DATA = {
        UserPoolId: Environment.userPoolId,
        ClientId: Environment.clientId
    };

    public static getAwsCognito(): any {
        return AWSCognito;
    }

    constructor() {
        AWS.config.update({
            region: Environment.region,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: ''
            })
        });
        AWS.config.region = Environment.region;
        AWS.config.update({ accessKeyId: 'null', secretAccessKey: 'null' });
    }

    /*
    ========================================================================================
        Cognito Authentication Functions
    ========================================================================================
    */

    authenticate(username: string, password: string, callback: CognitoCallback) {

        let authenticationData = {
            Username: username,
            Password: password,
        };

        let authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);

        let userData = {
            Username: username,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                var logins = {}
                logins['cognito-idp.' + Environment.region + '.amazonaws.com/' + Environment.userPoolId] = result.getIdToken().getJwtToken();

                // Add the User's Id Token to the Cognito credentials login map.
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: Environment.identityPoolId,
                    Logins: logins
                });

                console.log("UserLoginService: set the AWS credentials - " + JSON.stringify(AWS.config.credentials));
                console.log("UserLoginService: set the AWSCognito credentials - " + JSON.stringify(AWS.config.credentials));
                callback.cognitoCallback(null, result);
            },
            onFailure: (err) => {
                callback.cognitoCallback(err.message, null);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                callback.cognitoCallback(CognitoService.CHANGE_PASSWORD_ERROR, userAttributes);
            }
        });
    }

    getUserPool() {
        return new AWSCognito.CognitoUserPool(CognitoService._POOL_DATA);
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }

    getCognitoIdentity(): string {
        return AWS.config.credentials.accessKeyId;
    }

    getAccessToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.getCurrentUser() != null)
                this.getCurrentUser().getSession(function (err, session) {
                    if (err) {
                        console.log("CognitoUtil: Can't set the credentials:" + err);
                        reject(err);
                    }
                    else {
                        if (session.isValid()) {
                            resolve(session.getAccessToken().getJwtToken());
                        } else {
                            reject({ message: "CognitoUtil: Got the id token, but the session isn't valid" });
                        }
                    }
                });
            else
                reject({ message: "No current user." });
        });
    }

    getIdToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.getCurrentUser() != null)
                this.getCurrentUser().getSession(function (err, session) {
                    if (err) {
                        console.log("CognitoUtil: Can't set the credentials:" + err);
                        reject(err);
                    }
                    else {
                        if (session.isValid()) {
                            resolve(session.getIdToken().getJwtToken());
                        } else {
                            reject({ message: "CognitoUtil: Got the id token, but the session isn't valid" });
                        }
                    }
                });
            else
                reject({ message: "No current user." });
        });
    }

    getRefreshToken(callback: Callback): void {
        if (callback == null) {
            throw ("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    refresh(): void {
        this.getCurrentUser().getSession(function (err, session) {
            if (err) {
                console.log("CognitoUtil: Can't set the credentials:" + err);
            }

            else {
                if (session.isValid()) {
                    console.log("CognitoUtil: refreshed successfully");
                } else {
                    console.log("CognitoUtil: refreshed but session is still not valid");
                }
            }
        });
    }

    forgotPassword(username: string, callback: CognitoCallback) {
        let userData = {
            Username: username,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function (result) {

            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            },
            inputVerificationCode() {
                callback.cognitoCallback(null, null);
            }
        });
    }

    confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback) {
        let userData = {
            Username: email,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, password, {
            onSuccess: function () {
                callback.cognitoCallback(null, null);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            }
        });
    }

    /*
    ========================================================================================
        Cognito Registration Functions
    ========================================================================================
    */

    register(name: string, username: string, password: string, callback: CognitoCallback): void {
        let attributeList = [];

        let dataEmail = {
            Name: 'email',
            Value: username
        };
        attributeList.push(new AWSCognito.CognitoUserAttribute(dataEmail));

        this.getUserPool().signUp(username, password, attributeList, null, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                callback.cognitoCallback(null, result);
            }
        });

    }

    confirmRegistration(username: string, confirmationCode: string, callback: CognitoCallback): void {
        let userData = {
            Username: username,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);

        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                callback.cognitoCallback(null, result);
            }
        });
    }

    resendCode(username: string, callback: CognitoCallback, background?: boolean): void {
        let userData = {
            Username: username,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                if (background) {
                    callback.cognitoCallback(CognitoService.CODE_SENT_MESSAGE, result);
                }
                else {
                    callback.cognitoCallback(null, result);
                }
            }
        });
    }

    newPassword(username: string, existingPassword: string, newPassword: string, callback: CognitoCallback): void {
        let authenticationData = {
            Username: username,
            Password: existingPassword,
        };
        let authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);

        let userData = {
            Username: username,
            Pool: this.getUserPool()
        };

        let cognitoUser = new AWSCognito.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                // The api doesn't accept this field back
                delete userAttributes.email_verified;
                cognitoUser.completeNewPasswordChallenge(newPassword, requiredAttributes, {
                    onSuccess: function (result) {
                        callback.cognitoCallback(null, userAttributes);
                    },
                    onFailure: function (err) {
                        callback.cognitoCallback(err, null);
                    }
                });
            },
            onSuccess: function (result) {
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err, null);
            }
        });
    }
}