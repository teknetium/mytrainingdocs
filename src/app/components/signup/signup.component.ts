import { Component, OnInit } from '@angular/core';
import { AUTH_CONFIG } from '../../shared/services/auth.config';
import * as auth0 from 'auth0-js';
import { ENV } from '../../shared/services/env.config';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });

  email: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams
      .filter(params => params.email)
      .subscribe(params => {


        this.email = params.email;
      });
  }


  signup() {
    this._auth0.authorize({ action: 'signup', login_hint: this.email});
  }


}
