import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AUTH_CONFIG } from '../../shared/services/auth.config';
import * as auth0 from 'auth0-js';
import { BaseComponent } from '../base.component';


@Component({
  selector: 'app-paymentcallback',
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.css']
})
export class PaymentCallbackComponent extends BaseComponent implements OnInit {
  fName: string;
  lName: string;
  planName: string;
  planId: string;
  email: string;
  title: string;

  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });

  constructor(private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.fName = params['firstname'];
      this.lName = params['lastname'];
      this.planName = params['planName'];
      this.planId = params['planId'];
      this.email = params['email'];
      this.title = "Thank you for subscribing to the " + this.planName + " plan.";

      localStorage.setItem('fullName', this.fName + ' ' + this.lName);
      localStorage.setItem('lastName', this.lName);
      localStorage.setItem('firstName', this.fName);
      localStorage.setItem('planId', this.planId);
      localStorage.setItem('planName', this.planName);
    });
  }

  register() {
    this._auth0.authorize({ action: 'signup', login_hint: this.email });
  }
}
