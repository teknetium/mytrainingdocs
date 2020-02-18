import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(private auth: AuthService) {
    // Check for authentication and handle if hash present
  }

  ngOnInit() {
    localStorage.setItem('urlFrom', '/callback');
    this.auth.handleAuth();
  }
}
