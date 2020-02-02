import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { Observable } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.model';
import { EventModel } from '../../shared/interfaces/event.type';
import { User } from 'src/app/shared/interfaces/user.type';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  showNewUserModal = false;

  constructor(private auth: AuthService, private userService: UserService, private eventService: EventService) {
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      if (this.authenticatedUser.firstName === '') {
        this.showNewUserModal = true;
      }
    })
  }
  saveName() {
    this.userService.updateUser(this.authenticatedUser);
    this.showNewUserModal = false;
  }

  addEvent() {
    let now = new Date().getTime();
    let event: EventModel = {
      _id: String(now),
      userId: this.authenticatedUser._id,
      name: 'Fred',
      type: 'trainingDue',
      creationDate: now,
      actionDate: now + (20 * 86400000),
      teamId: 'foo',
      description: 'fubar'
    }

    this.eventService.addEvent(event);
  }

}
