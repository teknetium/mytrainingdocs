import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncSubject, BehaviorSubject, Subscription, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AUTH_CONFIG } from './auth.config';
import * as auth0 from 'auth0-js';
import { Auth0ProfileModel } from '../interfaces/auth0Profile.type';
import { Location } from '@angular/common';

import { ENV } from './env.config';

@Injectable()
export class AuthService {
  // Create Auth0 web auth instance
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });

  authenticatedUserProfile: Auth0ProfileModel;

  accessToken: string;
  expiresAt: number;
  isAdmin: boolean;
  // Create a stream of logged in status to communicate throughout app
  loggedIn = false;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  authenticatedUserProfile$ = new AsyncSubject<Auth0ProfileModel>();
  loggingIn: boolean;
  // Subscribe to token expiration stream
  refreshSub: Subscription;
  routeSub: Subscription;
  userMetaData = {
    firstName: '',
    lastName: '',
    role: '',
  };
  uid: string;

  constructor(private router: Router, private location: Location) {
//    this.isAuthenticated$.next(false);
    // If app auth token is not expired, request new token
    if (JSON.parse(localStorage.getItem('expires_at')) > Date.now()) {
      this.renewToken();
    }
  }

  setLoggedIn(value: boolean) {
    // Update login status behavior subject
    this.loggedIn$.next(value);
    this.isAuthenticated$.next(value);
    this.loggedIn = value;
    this.loggingIn = false;
  }

  getAuthenticatedUserProfileStream() {
    return this.authenticatedUserProfile$;
  }

  setAuthenticatedUserProfile(profile: Auth0ProfileModel) {
    this.authenticatedUserProfile$.next(profile);
    this.authenticatedUserProfile$.complete();
  }

  getIsAuthenticatedStream() {
    return this.isAuthenticated$.asObservable();
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  signup() {
    this._auth0.authorize({action: 'signup'});
  }
/*
  signupBeta() {
    this._auth0.authorize({action: 'signup', beta: 'true'});
  }
*/
  login() {
    this._auth0.authorize({action: 'login'});
  }

  handleAuth() {
    console.log('handleAuth', this.location);
    // When Auth0 hash parsed, get profile
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        window.location.hash = '';

        this._getProfile(authResult);
      } else if (err) {
        this._clearRedirect();
        this.router.navigate([`landingpage`]);
        console.error(`Error authenticating: ${err.error}`);
      }
    });
  }

  private _getProfile(authResult) {
    // Use access token to retrieve user's profile and set session
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
        console.log('USER PROFILE', profile);
        console.log('urlFrom', localStorage.getItem('urlFrom'));

        if (localStorage.getItem('urlFrom') === '/callback') {
          this._redirect();
          localStorage.removeItem('urlFrom');
        }
      } else if (err) {
        console.warn(`Error retrieving profile: ${err.error}`);
      }
    }); 
  }

  private _setSession(authResult, profile?) {
    this.expiresAt = (authResult.expiresIn * 1000) + Date.now();
    // Store expiration in local storage to access in constructor
    localStorage.setItem('expires_at', JSON.stringify(this.expiresAt));
    this.accessToken = authResult.accessToken;
    // If initial login, set profile and admin information
    if (profile) {
      this.userMetaData = profile['https://mytrainingdocs.com/user_metadata'];
      this.authenticatedUserProfile = <Auth0ProfileModel>{
        uid: profile.sub.substring(profile.sub.indexOf('|') + 1),
        email: profile.email,
        firstName: this.userMetaData.firstName,
        lastName: this.userMetaData.lastName
      };
      this.setAuthenticatedUserProfile(this.authenticatedUserProfile);
    }
    // Update login status in loggedIn$ stream
    this.setLoggedIn(true);
    // Schedule access token renewal
    this.scheduleRenewal();
  }

  /*
  private _checkAdmin(profile) {
    // Check if the user has admin role
    const roles = profile[AUTH_CONFIG.NAMESPACE] || [];
    return roles.indexOf('admin') > -1;
  }
  */

  private _redirect() {
    // Redirect with or without 'tab' query parameter
    // Note: does not support additional params besides 'tab'
    const fullRedirect = decodeURI(localStorage.getItem('authRedirect'));
    const redirectArr = fullRedirect.split('?tab=');
    const navArr = [redirectArr[0] || '/'];
    const tabObj = redirectArr[1] ? { queryParams: { tab: redirectArr[1] } } : '';
    
    console.log('_redirect', navArr, tabObj);

    if (!tabObj) {
      this.router.navigate(navArr);
    } else {
      this.router.navigate(navArr, tabObj);
    }

    // Redirection completed; clear redirect from storage
    this._clearRedirect();
  }

  private _clearRedirect() {
    // Remove redirect from localStorage
    localStorage.removeItem('authRedirect');
  }

  private _clearExpiration() {
    // Remove token expiration from localStorage
    localStorage.removeItem('expires_at');
  }

  logout() {
    this.setLoggedIn(false);
    // Remove data from localStorage
    this._clearExpiration();
    this._clearRedirect();
    // End Auth0 authentication session
    this._auth0.logout({
      clientId: AUTH_CONFIG.CLIENT_ID,
      returnTo: ENV.BASE_URI + '/landingpage'
    });
  }


  get tokenValid(): boolean {
    // Check if current time is past access token's expiration
    return Date.now() < JSON.parse(localStorage.getItem('expires_at'));
  }

  renewToken() {
    // Check for valid Auth0 session
    this._auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken) {
        this._getProfile(authResult);
      } else {
        this._clearExpiration();
      }
    });
  }

  scheduleRenewal() {
    // If last token is expired, do nothing
    if (!this.tokenValid) { return; }
    // Unsubscribe from previous expiration observable
    this.unscheduleRenewal();
    // Create and subscribe to expiration observable
    const expiresIn$ = of(this.expiresAt).pipe(
      mergeMap(
        expires => {
          const now = Date.now();
          // Use timer to track delay until expiration
          // to run the refresh at the proper time
          return timer(Math.max(1, expires - now));
        }
      )
    );

    this.refreshSub = expiresIn$
      .subscribe(
        () => {
          this.renewToken();
          this.scheduleRenewal();
        }
      );
  }

  unscheduleRenewal() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

}
