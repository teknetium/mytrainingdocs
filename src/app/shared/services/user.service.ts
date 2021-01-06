import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserTrainingService } from './userTraining.service';
import { SendmailService } from './sendmail.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel, UserFail, UserIdHash, OrgChartNode, UserBatchData, BuildOrgProgress } from '../interfaces/user.type';
import { Auth0ProfileModel } from '../interfaces/auth0Profile.type';
import { Router } from '@angular/router';
import { EventModel } from '../interfaces/event.type';
import { EventService } from './event.service';
import { JobTitleService } from './jobtitle.service';
import { TemplateMessageModel } from '../../shared/interfaces/message.type';
import * as cloneDeep from 'lodash/cloneDeep';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private myTeamIdHash: UserIdHash = {};
  private authenticatedUser: UserModel;

  // Writable streams
  private trainingStatusChangeBS$ = new BehaviorSubject<string>(null);
  private maxLevelBS$ = new BehaviorSubject<number>(0);
  private httpErrorBS$ = new BehaviorSubject<HttpErrorResponse>(null);
  private batchFailsBS$ = new BehaviorSubject<UserBatchData[]>([]);
  private myOrgUserNameListBS$ = new BehaviorSubject<string[]>([]);
  private myOrgBS$ = new BehaviorSubject<OrgChartNode[]>(null);
  private myDomainUsersBS$ = new BehaviorSubject<UserModel[]>(null);
  private supervisorsBS$ = new BehaviorSubject<OrgChartNode[][][]>(null);
  private directReportsBS$ = new BehaviorSubject<OrgChartNode[][][][]>(null);
  private buildOrgProgressBS$ = new BehaviorSubject<BuildOrgProgress>(null);
  private uidReportChainHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private authenticatedUserBS$ = new BehaviorSubject<UserModel>(null);
  private myTeamIdHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myOrgHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myTeamBS$ = new BehaviorSubject<UserModel[]>([]);
  private myOrgUsersBS$ = new BehaviorSubject<UserModel[]>([]);
  private myTeamCntBS$ = new BehaviorSubject<number>(0);
  private selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  private newUserBS$ = new BehaviorSubject<UserModel>(null);
  // allOrgUserHash contains all users matching authenticatedUser.org
  private allOrgUserHash: UserIdHash = {};
  // myOrgUserHash contains only the users in the sub-org of authenticatedUser
  private myOrgUserHash: UserIdHash = {};
  private myTeam: UserModel[] = [];

  private allOrgUsers: UserModel[] = [];
  private myOrgUsers: UserModel[] = [];
  private statusObj;
  private userFailBS$ = new BehaviorSubject<UserFail>(null);

  userTypeIconHash = {
    supervisor: 'fas fa-user-tie',
    individualContributor: 'fas fa-user',
    volunteer: 'fas fa-user-cowboy',
    contractor: 'fas fa-user-hard-hat',
    customer: 'fas fa-user-crown'
  }

  // Observables
  private authenticatedUserProfile$: Observable<Auth0ProfileModel>;

  private action: string;
  private teamId;

  authProfile: Auth0ProfileModel;
  batchCount = 0;
  org = '';
  newUserHash = {};
  fullNameHash = <UserModel>{};
  emailHash = <UserModel>{};
  newUserIds = [];
  supervisorName: string;
  supervisorEmail: string;
  supervisorObj: UserModel;
  newUserList: UserModel[] = [];

  newTeamMember = <UserModel>{
    _id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    org: '',
    directReports: [],
  };

  userFails: UserFail[] = [];

  nodes: any = [];
  userNode: OrgChartNode;
  uidReportChainHash = {};
  newBatchUserIndex = 0;
  newBatchUserData: UserBatchData[];
  newBatchUser: UserBatchData;
  batchUserAddedBS$ = new BehaviorSubject<UserModel>(null);
  batchUserFailedBS$ = new BehaviorSubject<UserBatchData>(null);

  orgProgress: BuildOrgProgress = {
    usersAdded: 0,
    usersProcessed: 0,
    usersTotal: 0,
    description: '',
    supervisorMatchFail: []
  }
  myOrgUserNames = [];
  reportChainNodeHash = {};
  myTeamIdIndexHash = {};
  myOrgNodes: OrgChartNode[] = [];
  //  directReports: OrgChartNode[][][][] = [[[[]]]];
  //  supervisors: OrgChartNode[][][] = [[[]]];
  //  supervisorUids: string[][][] = [[[]]];
  levelIndex = [];
  uidLevelIndexHash = {};
  maxLevel = 0;
  uidStatusHash: {};

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private sendmailService: SendmailService,
    private router: Router,
    private eventService: EventService,
  ) {
    this.action = 'init';

    this.authenticatedUserProfile$ = this.auth.getAuthenticatedUserProfileStream();
    this.authenticatedUserProfile$.subscribe({
      next: (profile) => {
        if (profile) {
          this.getUserByUid$(profile.uid).subscribe({
            next: (user) => {
              if (user) {
                // This is the uid field is the user id from Auth0.  This is set for the initial supervisor registrant 
                this.authenticatedUser = user;
                //          this.getAllOrgUsers();
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);

                if (this.authenticatedUser.userType === 'supervisor') {
                  //            this.org = this.authenticatedUser.org;
                  this.teamId = this.authenticatedUser.uid;
                  this.loadData(this.authenticatedUser.org, null);
                } else {
                  this.allOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
                  this.myOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
                }
              } else {
                this.getUserByEmail$(profile.email).subscribe({
                  next: (user) => {
                    if (user) {
                      user.uid = profile.uid;
                      user.userStatus = 'active';
                      user.emailVerified = true;
                      this.updateUser(user, false);
                      this.authenticatedUser = user;
                      if (this.authenticatedUser.jobTitle) {
                        this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                      }
                      this.authenticatedUserBS$.next(this.authenticatedUser);
                      this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                    } else {
                      let domain: string = profile.email.substring(profile.email.indexOf('@') + 1, profile.email.indexOf('.'));
                      this.getAllUsersInDomain$(domain).subscribe(users => {
                        this.myDomainUsersBS$.next(users);
                      });

                      this.authenticatedUser = <UserModel>{
                        _id: profile.uid,
                        uid: profile.uid,
                        userType: 'supervisor',
                        firstName: '',
                        lastName: '',
                        email: profile.email,
                        emailVerified: true,
                        teamId: null,
                        org: domain,
                        teamAdmin: false,
                        orgAdmin: true,
                        appAdmin: true,
                        userStatus: 'active',
                        trainingStatus: 'none',
                        jobTitle: '',
                        profilePicUrl: '',
                        supervisorId: null,
                        directReports: [],
                        settings: {
                          statusList: [],
                          showCSV: false,
                          showLegend: true,
                          showAlerts: true,
                          themeColor: {
                            name: 'orange ',
                            bgColor: 'orange',
                            primary: 'white',
                            secondary: '#c54f0a',
                          }
                        }
                      }

                      this.postUser$(this.authenticatedUser).subscribe({
                        next: (data) => {
                          this.authenticatedUser = data;
                          if (this.authenticatedUser.jobTitle) {
                            this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                          }
                          this.authenticatedUserBS$.next(this.authenticatedUser);
                          this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                          this.loadData(this.authenticatedUser.org, null);
                        },
                        error: (err) => { }
                      })

                    }
                  },
                  error: () => { }
                })
              }
            },
            error: () => { }
          })
        }
      },
      error: () => {
      }
    })
    
    /*
    error: (err) => {
    },
      complete: () => { }
  })
},
complete: () => { }
})
        }
      },
error: (err) => { },
  complete: () => { }
    });
        /*
        err => {
          this.getUserByEmail(profile.email).subscribe(
            res => {
              res.uid = profile.uid;
              res.userStatus = 'active';
              res.emailVerified = true;
              this.updateUser(res, false);
              this.authenticatedUser = res;
              if (this.authenticatedUser.jobTitle) {
                this.jobTitleService.add  JobTitle(this.authenticatedUser.jobTitle);
              }
              this.authenticatedUserBS$.next(this.authenticatedUser);
              this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
            },
            err => {
              let domain: string = profile.email.substring(profile.email.indexOf('@') + 1, profile.email.indexOf('.'));
              this.getAllUsersInDomain$(domain).subscribe(users => {
                this.myDomainUsersBS$.next(users);
              });

              this.authenticatedUser = <UserModel>{
                _id: profile.uid,
                uid: profile.uid,
                userType: 'supervisor',
                firstName: '',
                lastName: '',
                email: profile.email,
                emailVerified: true,
                teamId: null,
                org: domain,
                teamAdmin: false,
                orgAdmin: true,
                appAdmin: true,
                userStatus: 'active',
                trainingStatus: 'none',
                jobTitle: '',
                profilePicUrl: '',
                supervisorId: null,
                directReports: [],
                settings: {
                  statusList: [],
                  showCSV: false,
                  showLegend: true,
                  showAlerts: true,
                  themeColor: {
                    name: 'orange ',
                    bgColor: 'orange',
                    primary: 'white',
                    secondary: '#c54f0a',
                  }
                }
              }

              this.postUser$(this.authenticatedUser).subscribe((data) => {
                this.authenticatedUser = data;
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                this.loadData(this.authenticatedUser.org, null);
              });
            }
          )
        });
        */
  }

sendVerifyEmailMsg(toAddr, uid) {
  let message = <TemplateMessageModel>{
    to: toAddr,
    from: 'support@mytrainingdocs.com',
    templateId: 'd-5559cf461838417887b8ffd247983c92',
    dynamicTemplateData: {
      uid: uid
    },
  }
  this.sendmailService.sendTemplateMessages([message]);
}

sendRegistrationMsg(toAddr, fromAddr) {
  let message = <TemplateMessageModel>{
    to: toAddr,
    from: fromAddr,
    templateId: 'd-2d4430d31eee4a929344c8aa05e4afc7',
    dynamicTemplateData: {
      email: toAddr
    },
  }
  this.sendmailService.sendTemplateMessages([message]);
}
/*
  logLoginEvent() {
    let now = new Date().getTime();
    let loginEvent = <EventModel>{
      _id: String(new Date().getTime()),
      title: 'Login Event',
      type: 'loginSession',
      userId: this.authenticatedUser._id,
      teamId: this.authenticatedUser.teamId,
      desc: 'user login',
      mark: {
        iconClass: this.userTypeIconHash[this.authenticatedUser.userType],
        iconColor: 'purple',
        useBadge: false,
        badgeColor: 'blue'
      },
      creationDate: now,
      actionDate: now,
    }
 
    this.eventService.addEvent(loginEvent);
  }
  */
/*
  getAllOrgUsers() {
    this.getOrg$(this.authenticatedUser.org).subscribe(userList => {
      if (!userList) {
        return;
      }
      this.myOrgUsers = userList;
      for (let user of userList) {
        this.allOrgUserHash[user._id] = user;
        if (user.jobTitle) {
          this.jobTitleService.addJobTitle(user.jobTitle);
        }
      }
    })
  }
*/
loadData(org, userIdToSelect) {
  //    this.getTeam$(teamId).subscribe((userList) => {
  this.getOrg$(org).subscribe(allOrgUserList => {

    if (!allOrgUserList) {
      allOrgUserList = [];
    } else {
      this.allOrgUsers = allOrgUserList;
    }

    //      userList = userList.concat(this.newUserList);
    //      console.log('loadData : after merging with this.newUserLst', userList);

    this.myTeam = [];
    //      this.supervisorUids = [[[]]];
    this.myTeamIdHash = {};
    this.allOrgUserHash = {};
    this.myOrgUserHash = {};
    this.myOrgUserNames = [];


    this.myOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
    for (let user of allOrgUserList) {
      this.allOrgUserHash[user._id] = user;
    }

    this.buildMyOrgUserList(this.authenticatedUser, allOrgUserList);
    console.log("loadData maxLevel", this.maxLevel);
    this.maxLevelBS$.next(this.maxLevel);
    //      this.myOrgUsers = userList;
    this.myOrgUsersBS$.next(this.myOrgUsers);

    let index = 0;
    for (let user of this.myOrgUsers) {
      let fullName = user.firstName + ' ' + user.lastName;
      this.myOrgUserNames.push(fullName);
      if (user.teamId === this.authenticatedUser._id) {
        this.myTeamIdHash[user._id] = user;
        if (!this.myTeam.includes(user)) {
          this.myTeamIdIndexHash[user._id] = index++;
          this.myTeam.push(user);
        }
      }
      if (user.jobTitle) {
        this.jobTitleService.addJobTitle(user.jobTitle);
      }
    }

    this.userTrainingService.getUTForTeam(this.teamId);

    this.myTeamIdHash[this.authenticatedUser._id] = this.authenticatedUser;
    this.allOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
    this.myTeamBS$.next(this.myTeam);
    this.myOrgHashBS$.next(this.myOrgUserHash);

    this.myOrgUserNameListBS$.next(this.myOrgUserNames);

    this.myTeamIdHashBS$.next(this.myTeamIdHash);
    if (userIdToSelect) {
      this.selectUser(userIdToSelect);
    }

    this.nodes = [];
    let rootNode;
    //      this.directReports = [[[[]]]];
    this.buildOrgChart(this.authenticatedUser._id, false);
    this.nodes.push(rootNode);
    this.myOrgBS$.next(this.myOrgNodes);
  });
}

buildMyOrgUserList(user: UserModel, allOrgUsers: UserModel[]) {
  this.myOrgUserHash[user._id] = user;
  this.myOrgUsers.push(user);
  this.userTrainingService.initUserTrainingsForUser(user._id);
  let level = 1;
  this.addDirectReportsToMyOrgUserHash(user, level++);

}

addDirectReportsToMyOrgUserHash(user: UserModel, level: number) {
  if (level > this.maxLevel) {
    this.maxLevel = level;
  }
  level++
  for (let userId of user.directReports) {
    let drUser = this.allOrgUserHash[userId];
    this.myOrgUserHash[drUser._id] = drUser;
    this.myOrgUsers.push(drUser);
    //      this.userTrainingService.initUserTrainingsForUser(drUser._id);
    if (drUser.directReports.length > 0) {
      this.addDirectReportsToMyOrgUserHash(drUser, level);
    }
  }
}

buildOrgChart(uid: string, subChart: boolean) {
  if (!this.allOrgUserHash[uid]) {
    return;
  }
  //    this.directReports = [[[[]]]];
  this.nodes = [];
  let rootNode: OrgChartNode = {
    _id: uid,
    fName: this.allOrgUserHash[uid].firstName,
    lName: this.allOrgUserHash[uid].lastName,
    cssClass: 'org-chart-top',
    image: '',
    extra: {
      uid: this.authenticatedUser._id,
      reportChain: [],
      peopleCnt: 0,
    },
    title: this.allOrgUserHash[uid].jobTitle,
    childs: [],
    level: 0,
  };

  this.myOrgNodes.push(rootNode);
  let orgLevel = 0;
  this.levelIndex[orgLevel] = 0;
  let reportChain = [uid];
  this.reportChainNodeHash[uid] = rootNode;

  //    this.supervisors[orgLevel] = [];
  //    this.supervisors[orgLevel][0] = [];
  for (let i = 0; i < this.allOrgUserHash[uid].directReports.length; i++) {
    //      let levelIndexArray: number[] = Object.assign([], this.levelIndex);
    //      let orgTree: OrgChartNode[][][] = cloneDeep(this.supervisors);
    //      this.directReports.push(orgTree);
    let node = this.buildUserNode(this.allOrgUserHash[uid].directReports[i], Object.assign([], reportChain), orgLevel);
    rootNode.childs.push(node);
    this.myOrgNodes.push(node);
    /*
    if (!orgTree[orgLevel][levelIndexArray[orgLevel]]) {
      orgTree[orgLevel][levelIndexArray[orgLevel]] = [];
    }
    orgTree[orgLevel][levelIndexArray[orgLevel]].push(node);
    levelIndexArray[orgLevel] = levelIndexArray[orgLevel] + 1;
    */
  }

  this.nodes.push(rootNode);
  //    this.myOrgBS$.next(this.myOrgNodes);
  /*
  if (!subChart) {
    this.uidReportChainHashBS$.next(Object.assign({}, this.uidReportChainHash));
  }
  this.directReportsBS$.next(this.directReports);
  */
}

buildUserNode(userId: string, reportChain: string[], level: number): OrgChartNode {
  this.uidReportChainHash[userId] = reportChain;
  let user = this.allOrgUserHash[userId];

  if (!user) {
    console.log('buildUserNode ', userId, this.allOrgUserHash);
  }
  let userNode = <OrgChartNode>{
    _id: user._id,
    fName: user.firstName,
    lName: user.lastName,
    cssClass: 'org-chart-node',
    image: '',
    title: '',
    extra: {
      uid: userId,
      reportChain: reportChain,
      peopleCnt: 0
    },
    childs: [],
  }

  this.reportChainNodeHash[userId] = userNode;
  userNode.title = user.jobTitle;

  for (let uid of reportChain) {
    this.reportChainNodeHash[uid].extra.peopleCnt++;
  }


  level++;
  //    if (!levelIndexArray[level]) {
  //      levelIndexArray[level] = 0;
  //    }
  userNode.childs = [];
  let newReportChain = Object.assign([], reportChain);
  newReportChain.push(userId);
  //    if (!orgTree[level]) {
  //      orgTree[level] = [];
  //    }

  for (let i = 0; i < user.directReports.length; i++) {
    userNode.extra.peopleCnt++;
    //      userNode.level = myLevelIndex;

    let node = this.buildUserNode(user.directReports[i], Object.assign([], newReportChain), level);
    userNode.childs.push(node);
    this.myOrgNodes.push(node);
    /*
    if (!orgTree[level][myLevelIndex]) {
      orgTree[level][myLevelIndex] = [];
    }
    orgTree[level][myLevelIndex].push(node);
    levelIndexArray[level] = levelIndexArray[level] + 1;
    */
  }
  return userNode;
}

/*
deleteAllUsers() {
  this.deleteAll$().subscribe(user => {

  })
}
*/
emailIsValid(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email)
}

createNewUsersFromBatch(batchUsers: UserBatchData[], testing: boolean) {
  let emailList = [];
  let statusList: string[] = [];
  let supervisorMatchFail = [];
  this.newTeamMember.org = this.authenticatedUser.org;
  this.fullNameHash[this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName] = this.authenticatedUser;
  this.emailHash[this.authenticatedUser.email] = this.authenticatedUser;

  let message: TemplateMessageModel;
  let msgs: TemplateMessageModel[] = [];
  let batchCnt = 1;
  let _id = String(new Date().getTime());
  for (let batchUser of batchUsers) {
    this.newTeamMember = cloneDeep(this.newTeamMember);
    if (!batchUser.userType) {
      this.newTeamMember.userType = 'individualContributor';
    } else {
      this.newTeamMember.userType = batchUser.userType;
    }
    this.newTeamMember._id = String(_id + '-' + batchCnt++);
    this.newTeamMember.firstName = batchUser.firstName;
    this.newTeamMember.lastName = batchUser.lastName;
    if (!this.emailIsValid(batchUser.email)) {
      statusList.push('invalidEmailFormat');
    } else if (emailList.includes(batchUser.email)) {
      statusList.push('duplicateEmail');
    } else {
      this.newTeamMember.email = batchUser.email;
      if (!testing) {
        message = {
          to: this.newTeamMember.email,
          from: 'greg@mytrainingdocs.com',
          templateId: 'd-2d4430d31eee4a929344c8aa05e4afc7',
          dynamicTemplateData: {
            email: this.newTeamMember.email
          },
        }
        msgs.push(Object.assign({}, message));
        statusList.push('accountPending');
      }
      this.newTeamMember.userStatus = 'pending';
      emailList.push(batchUser.email);
    }
    this.newTeamMember.jobTitle = batchUser.jobTitle;
    this.newTeamMember.trainingStatus = 'none';
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.settings = {
      statusList: cloneDeep(statusList),
      showCSV: true,
      showLegend: true,
      showAlerts: true,
      themeColor: {
        name: 'orange ',
        bgColor: 'orange',
        primary: 'white',
        secondary: '#c54f0a',
      }
    }
    statusList = [];
    this.newUserHash[this.newTeamMember._id] = batchUser;
    this.newUserIds.push(this.newTeamMember._id);
    this.newUserList.push(this.newTeamMember);
    this.fullNameHash[this.newTeamMember.firstName + ' ' + this.newTeamMember.lastName] = this.newTeamMember;
    this.emailHash[this.newTeamMember.email] = this.newTeamMember;
    this.allOrgUserHash[this.newTeamMember._id] = this.newTeamMember;
  }

  if (msgs.length > 0) {
    this.sendmailService.sendTemplateMessages(msgs);
  }

  for (let nUser of this.newUserList) {
    if (!this.fullNameHash[this.newUserHash[nUser._id].supervisorName]) {
      //      if (!this.emailHash[this.newUserHash[nUser._id].supervisorEmail]) {
      nUser.settings.statusList.push('unknownSupervisor');
      nUser.supervisorId = this.authenticatedUser._id;
      nUser.teamId = this.authenticatedUser._id;
      this.authenticatedUser.directReports.push(nUser._id);
    } else {
      this.fullNameHash[this.newUserHash[nUser._id].supervisorName].directReports.push(nUser._id);
      this.fullNameHash[this.newUserHash[nUser._id].supervisorName].userType = 'supervisor';
      nUser.supervisorId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
      nUser.teamId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
      //        this.emailHash[this.newUserHash[nUser._id].supervisorEmail].directReports.push(nUser._id);
      //        this.emailHash[this.newUserHash[nUser._id].supervisorEmail].userType = 'supervisor';
      //        nUser.supervisorId = this.emailHash[this.newUserHash[nUser._id].supervisorEmail]._id;
      //        nUser.teamId = this.emailHash[this.newUserHash[nUser._id].supervisorEmail]._id;
    }
  }

  this.updateUser(this.authenticatedUser, false);

  let dbCnt = 0;
  let batchUserAddedCount = 0;
  let startIndex = 0;
  let chunckSize = 100;
  while (startIndex < this.newUserList.length) {
    let tmpArray = Object.assign([], this.newUserList.slice(startIndex, startIndex + chunckSize));
    startIndex += chunckSize;
    this.postBulkUsers$(tmpArray).subscribe(users => {
      batchUserAddedCount += users.length;
      if (batchUserAddedCount === this.newUserList.length) {
        this.loadData(this.authenticatedUser.org, null);
      }
    });
  }
  /*
      for (let user of this.newUserList) {
        this.postBulkUser$(user).subscribe(user => {
          dbCnt++;
          if (dbCnt === this.newUserList.length) {
            this.newUserList = [];
            this.loadData(this.authenticatedUser.org, null);
          }
        }, err => {
            
        });
      }
      */
  this.updateUser(this.authenticatedUser, false);
}

createNewUser(user: UserModel, reload: boolean) {
  this.postUser$(user).subscribe(data => {
    this.authenticatedUser.directReports.push(data._id);
    let fullName = user.firstName + ' ' + user.lastName;
    this.myOrgUserNames.push(fullName);
    this.myOrgUserNameListBS$.next(this.myOrgUserNames);
    this.allOrgUserHash[user._id] = user;
    this.myTeamIdHash[user._id] = user;
    if (!this.myTeam.includes(user)) {
      this.myTeam.push(user);
    }
    this.myTeamBS$.next(this.myTeam);
    this.myOrgHashBS$.next(this.allOrgUserHash);
    this.myTeamIdHashBS$.next(this.myTeamIdHash);
    this.updateUser(this.authenticatedUser, false);

    this.buildOrgChart(this.authenticatedUser._id, false);
    if (data.jobTitle) {
      this.jobTitleService.addJobTitle(data.jobTitle);
    }

    this.sendRegistrationMsg(data.email, this.authenticatedUser.email);
    /*
          if (reload) {
            this.loadData(this.authenticatedUser._id, data._id);
          }
          */
  },
    err => {
      console.log('postUser$ ', err);
      let userFail = {
        user: user,
        errorType: 'http',
        message: err
      }

      this.userFailBS$.next(userFail);
    })
}

deleteUser(id: string) {
  this.deleteUser$(id).subscribe(data => {
    let deletedUser = this.allOrgUserHash[id];
    this.allOrgUserHash[deletedUser.supervisorId].directReports.splice(this.allOrgUserHash[deletedUser.supervisorId].directReports.indexOf(id, 1));
    delete this.allOrgUserHash[id];
    delete this.myTeamIdHash[id];
    this.myTeam.splice(this.myTeam.indexOf(deletedUser), 1);
    this.myOrgUserNames.splice(this.myOrgUserNames.indexOf(deletedUser.firstName + ' ' + deletedUser.lastName));

    this.myTeamBS$.next(this.myTeam);
    this.myOrgUserNameListBS$.next(this.myOrgUserNames);
    this.myTeamIdHashBS$.next(this.myTeamIdHash);
    this.myOrgHashBS$.next(this.allOrgUserHash);
    //      this.loadData(this.teamId, null);
  });
}

getTrainingStatusChangeStream(): Observable < string > {
  return this.trainingStatusChangeBS$.asObservable();
}

getMaxLevelStream(): Observable < number > {
  return this.maxLevelBS$.asObservable();
}

getHttpErrorStream(): Observable < HttpErrorResponse > {
  return this.httpErrorBS$.asObservable();
}

getUserFailStream(): Observable < UserFail > {
  return this.userFailBS$.asObservable();
}

getBatchUserFailsStream(): Observable < UserBatchData[] > {
  return this.batchFailsBS$.asObservable();
}

getOrgProgressStream(): Observable < BuildOrgProgress > {
  return this.buildOrgProgressBS$.asObservable();
}

setUserStatusPastDue(uid: string) {
  this.allOrgUserHash[uid].trainingStatus = 'pastDue';
  //    this.myTeam[]
  this.updateUser(this.allOrgUserHash[uid], false);
  this.trainingStatusChangeBS$.next(uid);
}
setUsersStatusPastDue(uids: string[]) {
  this.setUsersStatusPastDue$(uids).subscribe(responseObj => {
    console.log("setUsersStatusPastDue ", responseObj);
  });
  for (let uid of uids) {
    this.allOrgUserHash[uid].trainingStatus = 'pastDue';
  }
}

setUserStatusUpToDate(uid: string) {
  this.allOrgUserHash[uid].trainingStatus = 'upToDate';
  this.updateUser(this.allOrgUserHash[uid], false);
}

setUsersStatusUpToDate(uids: string[]) {
  this.setUsersStatusUpToDate$(uids).subscribe(responseObj => {
    console.log("setUsersStatusUpToDate ", uids, responseObj);
  });;
  for (let uid of uids) {
    this.allOrgUserHash[uid].trainingStatus = 'upToDate';
  }
}

setUserStatusNone(uid: string) {
  this.allOrgUserHash[uid].trainingStatus = 'none';
  this.updateUser(this.allOrgUserHash[uid], false);
}
setUsersStatusNone(uids: string[]) {
  this.setUsersStatusNone$(uids).subscribe(responseObj => {
    console.log("setUsersStatusNone ", uids, responseObj);
  });;
  for (let uid of uids) {
    this.allOrgUserHash[uid].trainingStatus = 'none';
  }
}

getUIDReportChainHashStream(): Observable < UserIdHash > {
  return this.uidReportChainHashBS$.asObservable();
}

getOrgHashStream(): Observable < UserIdHash > {
  return this.myOrgHashBS$.asObservable();
}

getMyOrgUsersStream(): Observable < UserModel[] > {
  return this.myOrgUsersBS$.asObservable();
}

getMyDomainUsersStream(): Observable < UserModel[] > {
  return this.myDomainUsersBS$.asObservable();
}

getSelectedUserStream(): Observable < UserModel > {
  return this.selectedUserBS$.asObservable();
}

selectAuthenticatedUser() {
  this.selectedUserBS$.next(this.authenticatedUser);
}

/*
deleteOrgUsers() {
  let orgUserCnt = this.myOrgUsers.length;
  for (let user of this.myOrgUsers) {
    if (user._id === this.authenticatedUser._id) {
      continue;
    }
    this.deleteUser(user._id).subscribe(data => {
      orgUserCnt--;
      if (orgUserCnt === 0) {
        this.loadData(this.org, this.authenticatedUser._id);
      }
    })
  }
}
*/

selectUser(uid: string) {
  if (!uid) {
    this.selectedUserBS$.next(null);
  } else {
    this.selectedUserBS$.next(this.allOrgUserHash[uid]);
  }
  //    this.buildOrgChart(uid, true);
}

updateUser(user: UserModel, reload: boolean) {
  this.action = 'save';
  this.putUser$(user).subscribe((updatedUser) => {
    //      this.buildOrgChart(this.authenticatedUser._id, false);
    if (reload) {
      this.loadData(this.authenticatedUser.org, user._id);
    }
  });
}

getEmailForUser(uid: string): string {
  if (this.allOrgUserHash[uid].emailVerified) {
    return this.allOrgUserHash[uid].email;
  } else {
    return null;
  }
}
getSupervisorEmailForUser(uid: string): string {
  if (this.allOrgUserHash[this.allOrgUserHash[uid].supervisorId]?.emailVerified) {
    return this.allOrgUserHash[this.allOrgUserHash[uid].supervisorId].email;
  } else {
    return null;
  }
}

statusCheck() {
  this.statusCheck$(this.authenticatedUser._id).subscribe(statusObj => {
    this.loadData(this.authenticatedUser._id, null);
  })
}

getMyOrgUserNameListStream(): Observable < string[] > {
  return this.myOrgUserNameListBS$.asObservable();
}

getMyTeamIdHashStream(): Observable < UserIdHash > {
  return this.myTeamIdHashBS$.asObservable();
}

getMyTeamCntStream(): Observable < number > {
  return this.myTeamCntBS$.asObservable();
}

getDirectReportsStream(): Observable < OrgChartNode[][][][] > {
  return this.directReportsBS$.asObservable();
}

getMyOrgStream(): Observable < OrgChartNode[] > {
  return this.myOrgBS$.asObservable();
}

getMyTeamStream(): Observable < UserModel[] > {
  return this.myTeamBS$.asObservable();
}

getAuthenticatedUserStream(): Observable < UserModel > {
  return this.authenticatedUserBS$.asObservable();
}

getNewUserStream(): Observable < UserModel > {
  return this.newUserBS$.asObservable();
}

  private get _authHeader(): string {
  return `Bearer ${this.auth.accessToken}`;
}

// POST new User (login required)
postUser$(user: UserModel): Observable < UserModel > {
  return this.http
    .post<UserModel>(`${ENV.BASE_API}user/new/`, user, {
      headers: new HttpHeaders().set('Authorization', this._authHeader),
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}
postBulkUsers$(users: UserModel[]): Observable < UserModel[] > {
  return this.http
    .post<UserModel[]>(`${ENV.BASE_API}user/bulknew/`, users, {
      headers: new HttpHeaders().set('Authorization', this._authHeader),
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

setUsersStatusUpToDate$(uids: string[]): any {
  return this.http
    .put<string[]>(`${ENV.BASE_API}user/bulkuptodate/`, uids, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

setUsersStatusPastDue$(uids: string[]): any {
  return this.http
    .put<string[]>(`${ENV.BASE_API}user/bulkpastdue/`, uids, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

setUsersStatusNone$(uids: string[]): any {
  return this.http
    .put<string[]>(`${ENV.BASE_API}user/bulknone/`, uids, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

activateUser(email: string) {
  this.getUserByEmail$(email).subscribe(user => {
    user.userStatus = 'active';
    this.putUser$(user).subscribe(updatedUser => {
      console.log('set userStatus to active');
    })
  })
}

//
getUser$(userId: string): Observable < UserModel > {
  return this.http
    .get<UserModel>(`${ENV.BASE_API}user/${userId}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}
getUserByEmail$(email: string): Observable < UserModel > {
  return this.http
    .get<UserModel>(`${ENV.BASE_API}user/email/${email}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

getUserByUid$(uid: string): Observable < UserModel > {
  return this.http
    .get<UserModel>(`${ENV.BASE_API}user/uid/${uid}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}
/*
  getAllUsers$(teamId: string): Observable<UserModel[]> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}users/${teamId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */


getTeam$(teamId: string): Observable < UserModel[] > {
  return this.http
    .get<UserModel[]>(`${ENV.BASE_API}users/${teamId}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}


getOrg$(uid: string): Observable < UserModel[] > {
  return this.http
    .get<UserModel[]>(`${ENV.BASE_API}users/org/${uid}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

getAllUsersInDomain$(domain: string): Observable < UserModel[] > {
  return this.http
    .get<UserModel[]>(`${ENV.BASE_API}users/domain/${domain}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

statusCheck$(teamId: string): Observable < {} > {
  return this.http
    .get(`/api/daily/usertrainingstatuscheck`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

putUser$(user: UserModel): Observable < UserModel > {
  return this.http
    .put<UserModel>(`${ENV.BASE_API}users/${user._id}`, user, {
      headers: new HttpHeaders().set('Authorization', this._authHeader),
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}

deleteUser$(userId: string): Observable < {} > {
  return this.http
    .delete(`${ENV.BASE_API}users/${userId}`, {
      headers: new HttpHeaders().set('Authorization', this._authHeader),
    })
    .pipe(
      catchError((error) => this._handleError(error))
    );
}
  /*
  deleteAll$(): Observable<{}> {
    return this.http
      .delete(`${ENV.BASE_API}users/all`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
  }
  */

  private _handleError(err: HttpErrorResponse | any): Observable < any > {
  const errorMsg = err.error.message || 'Error: Unable to complete request.';
  console.log("_handleError", err);
  //    this.httpErrorBS$.next(err);
  if(err.error.message && err.error.message.indexOf('No JWT present') > -1) {
  this.auth.login();
}
return ObservableThrowError(errorMsg);
  }
}
