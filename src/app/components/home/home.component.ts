import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
import { EventService } from '../../shared/services/event.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { EventModel } from '../../shared/interfaces/event.type';
import { TrainingViewerComponent } from '../trainings/training-viewer/training-viewer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  showNewUserModal = false;
  currentTab = 'myTrainings';

  constructor(private auth: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private eventService: EventService) {
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
      this.userService.selectAuthenticatedUser();
      if (this.authenticatedUser.firstName === '') {
        this.showNewUserModal = true;
      }
    })
  }

  saveName() {
    this.userService.updateUser(this.authenticatedUser);
    this.showNewUserModal = false;
  }

  createNewTraining() {
    this.trainingService.addNewTraining();
  }

  setCurrentTab(tabName) {
    this.currentTab = tabName;
  }
}
