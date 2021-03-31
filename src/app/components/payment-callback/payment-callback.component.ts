import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AUTH_CONFIG } from '../../shared/services/auth.config';
import * as auth0 from 'auth0-js';

@Component({
  selector: 'app-paymentcallback',
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.css']
})
export class PaymentCallbackComponent implements OnInit {
  fName: string;
  lName: string;
  planName: string;
  email: string;

  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });

  constructor(private route: ActivatedRoute) {
    // Check for authentication and handle if hash present
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.fName = params['firstname'];
      this.lName = params['firstname'];
      this.planName = params['planName'];
      this.email = params['email'];
      this._auth0.authorize({ action: 'signup', login_hint: this.email });
//      console.log("paymentcallback...", this.fName, this.lName, this.subId, this.email);
    });
    
  }
}
