import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { MessageModel } from '../../shared/interfaces/message.type';
import { MessageService } from 'src/app/shared/services/message.service';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
//  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent extends BaseComponent implements OnInit {

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  showNewUserModal = false;
  mboxes = ['Inbox', 'Sent'];

  mboxIndex = 0;
  currentMboxIndex = 0;
  currentMbox = 'Inbox';
  inbox: MessageModel[] = [];
  sent: MessageModel[] = [];
  inbox$: Observable<MessageModel[]>;
  sent$: Observable<MessageModel[]>;
  mBoxes = {
    Inbox: this.inbox,
    Sent: this.sent
  }


  constructor(
    private messageService: MessageService
  ) {
    super();
    this.inbox$ = this.messageService.getInboxStream();
    this.sent$ = this.messageService.getInboxStream();
  }


  ngOnInit() {

  }

  setMbox(index: number) {
    this.currentMboxIndex = index;
    this.currentMbox = this.mboxes[index];
  }

}
