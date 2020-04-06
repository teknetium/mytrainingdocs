import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Observable, bindCallback } from 'rxjs';
import { UserModel } from 'src/app/shared/interfaces/user.type';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent extends BaseComponent implements OnInit {

  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;

  colors = [
    {
      name: 'grey',
      primary: 'black',
      secondary: '#e5e5e5',
      bgColor: '#f1f1f1',
    },
    {
      name: 'green',
      primary: 'white',
      secondary: 'darkgreen',
      bgColor: '#87d068',
    },
    {
      name: 'blue',
      bgColor: '#2db7f5',
      primary: 'white',
      secondary: '#0c0cc1',
    },
    {
      name: 'orange ',
      bgColor: 'orange',
      primary: 'black',
      secondary: '#dddddd',
    },
    {
      name: 'purple',
      bgColor: '#ac76b1',
      primary: 'white',
      secondary: 'purple',
    },
  ]


  constructor(private userService: UserService) {
    super();

    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();

  }

  ngOnInit(): void {
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
    });

  }

  updateUserSettings(event, property, value) {
    console.log('updateUserSettings', event, property, value);
    this.authenticatedUser.settings[property] = value;
    this.userService.updateUser(this.authenticatedUser, false);
    this.userService.selectAuthenticatedUser();
  }

}
