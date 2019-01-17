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

    public static _REGION = Environment.region;

    public static _IDENTITY_POOL_ID = Environment.identityPoolId;
    public static _USER_POOL_ID = Environment.userPoolId;
    public static _CLIENT_ID = Environment.clientId;

    public static _POOL_DATA = {
        UserPoolId: CognitoService._USER_POOL_ID,
        ClientId: CognitoService._CLIENT_ID
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
            onSuccess: function (result) {
                var logins = {}
                logins['cognito-idp.' + CognitoService._REGION + '.amazonaws.com/' + CognitoService._USER_POOL_ID] = result.getIdToken().getJwtToken();

                // Add the User's Id Token to the Cognito credentials login map.
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: CognitoService._IDENTITY_POOL_ID,
                    Logins: logins
                });

                console.log("UserLoginService: set the AWS credentials - " + JSON.stringify(AWS.config.credentials));
                console.log("UserLoginService: set the AWSCognito credentials - " + JSON.stringify(AWS.config.credentials));
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err.message, null);
            },
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

    resendCode(username: string, callback: CognitoCallback): void {
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
                callback.cognitoCallback(null, result);
            }
        });
    }
}