import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(private auth: AuthService, private location: Location) {
    // Check for authentication and handle if hash present
  }

  ngOnInit() {
    localStorage.setItem('urlFrom', this.location.path());
    this.auth.handleAuth();
  }
}
