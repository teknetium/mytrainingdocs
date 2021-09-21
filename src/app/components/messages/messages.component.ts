import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { MessageService } from '../../shared/services/message.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { MessageModel } from '../../shared/interfaces/message.type';


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
  composeMsg = false;
  newMsg: MessageModel;
  userNameToSearchFor: string;
  myOrgUserHash$: Observable<UserIdHash>;
  myOrgUserHash: UserIdHash = {};
  userIds: string[];
  userObjs: UserModel[];
  matchingUsers: string[] = [];
  userNameHash = {};

  constructor(
    private messageService: MessageService,
    private userService: UserService
  ) {
    super();

    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.inbox$ = this.messageService.getInboxStream();
    this.sent$ = this.messageService.getInboxStream();
    this.myOrgUserHash$ = this.userService.getOrgHashStream();

  }

  ngOnInit() {
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
    });
    this.myOrgUserHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgUserHash => {
      if (!orgUserHash) {
        return;
      }

      this.myOrgUserHash = orgUserHash;

      this.myOrgUserHash = orgUserHash;
      this.userIds = Object.keys(this.myOrgUserHash);
      this.userObjs = Object.values(this.myOrgUserHash);
      for (let uid of this.userIds) {
        let user = this.myOrgUserHash[uid];
        let fullName = user.firstName + ' ' + user.lastName;
        this.userNameHash[fullName] = user;
      }
    });

    this.newMsg = <MessageModel>{
      _id: String(new Date().getTime()),
      to: '',
      from: '',
      subject: '',
      uid: this.authenticatedUser.uid,
      state: 'draft',
      category: 'userMessage'
    }

  }

  composeNewMsg(show: boolean) {
    this.composeMsg = true;
  }

  setMbox(index: number) {
    this.currentMboxIndex = index;
    this.currentMbox = this.mboxes[index];
  }

  cancelComposeMsg() {

    this.newMsg = <MessageModel>{
      _id: String(new Date().getTime()),
      to: '',
      from: '',
      subject: '',
      uid: this.authenticatedUser.uid,
      state: 'draft',
      category: 'userMessage'
    }
    this.composeMsg = false;
  }

  sendMsg() {
    console.log("send message", this.newMsg);
    let user = this.userNameHash[this.newMsg.to];
    let toList = [];
    toList.push
    this.newMsg.from = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName + ' ' + '<support@mytrainingdocs.com>';
    this.messageService.sendMessages(this.newMsg, [user.email], null, false);
    this.composeMsg = false;
    this.newMsg.to = '';
  }

  onUserSearchChange(value: string): void {
    let userNameList: string[] = [];
    for (let user of this.userObjs) {
      userNameList.push(user.firstName + ' ' + user.lastName);
    }
    this.matchingUsers = userNameList.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    let index = userNameList.indexOf(value);
  }

}
