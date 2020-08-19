import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { ResizeEvent } from '../../shared/interfaces/event.type';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { UserTrainingModel, UidUTHash } from '../../shared/interfaces/userTraining.type';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { Observable, BehaviorSubject, Subscription, defer } from 'rxjs';
import { UserModel, UserFail, UserIdHash, OrgChartNode, BuildOrgProgress, UserBatchData } from '../../shared/interfaces/user.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SendmailService } from '../../shared/services/sendmail.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { MessageModel, TemplateMessageModel } from '../../shared/interfaces/message.type';
import { takeUntil, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import { BaseComponent } from '../base.component';
import FlatfileImporter from "flatfile-csv-importer";
import { JoyrideService } from 'ngx-joyride';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { stringify } from 'querystring';
// import * as names from '../../../assets/names.json';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('supervisorSignupToggle', [
      // ...
      state('closed', style({
        'height': '0'
      })),
      state('open', style({
        'height': '50px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('userSlide', [
      // ...
      state('in', style({
        'opacity': '1'
      })),
      state('out', style({
        'opacity': '0'
      })),
      transition('in => out', [
        animate('400ms')
      ]),
      transition('out => in', [
        animate('400ms')
      ])
    ]),
    trigger('switchUserToggle', [
      // ...
      state('', style({
        'visibility': 'hidden',
        'height': '0'
      })),
      state('open', style({
        'visibility': 'visible',
        'height': 'fit-content',
      })),
      transition('open => closed', [
        animate('700ms')
      ]),
      transition('* => open', [
        animate('1000ms')
      ]),
    ])
  ]
})
export class MyteamComponent extends BaseComponent implements OnInit {

  LICENSE_KEY = "2bda9380-a84c-11e7-8243-1d92e7c67d6d";
  results = "";
  browserInnerHeight;
  browserInnerWidth;
  contentHeight;
  contentWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor(window.innerHeight * .9);
    this.contentWidth = Math.floor(window.innerWidth * .9);
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    /*
    if (this.orgChartWidth < 800) {
      this.orgChartContainerSize = 'small';
    } else if (this.orgChartWidth < 900) {
      this.orgChartContainerSize = 'medium';
    } else {
      this.orgChartContainerSize = 'large';
    }
    this.peopleCntArray = this.peopleCntHash[this.orgChartContainerSize];
    */
  }

  private importer: FlatfileImporter;

  userTypeIconHash = {
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fad fa-fw fa-user-tie',
    volunteer: 'fad fa-fw fa-user-cowboy',
    customer: 'fad fa-fw fa-user-crown',
    candidate: 'fad fa-fw fa-user-graduate'
  }
  /*
  trainingStatusHash = {
    upToDate: {
      class
    }
  }
  */
  userTrainingStatusColorHash = {
    upToDate: '#52c41a',
    pastDue: 'red',
    none: 'black'
  }
  includeNewSupervisorsTeam = true;
  isNewSupervisorPanelOpen = false;
  isUserAddPanelOpen = false;
  assignableTrainings: TrainingModel[] = [];
  showUserTrainingModal = false;

  buildOrgProgress$: Observable<BuildOrgProgress>;
  myOrgChartData$: Observable<OrgChartNode[]>;
  myOrgUserHash$: Observable<UserIdHash>;
  myOrgUserList$: Observable<UserModel[]>;
  userTrainings$: Observable<UserTrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  newUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedUserId: string;
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myOrgUserHash: UserIdHash = {};
  myOrgUserObjs: UserModel[];
  myOrgUsers: string[] = [];
  myOrgSupervisors: string[] = [];
  myTeamIdHash: UserIdHash;
  myTeam$: Observable<UserModel[]>;
  myTeam: UserModel[] = [];
  jobTitles$: Observable<string[]>;
  jobTitles: string[] = [];
  options: string[];
  uidReportChainHash$: Observable<UserIdHash>;
  myTeamIdHash$: Observable<UserIdHash>;
  showNewUserModal = false;
  supervisorSelected = false;
  newTeamMember: UserModel = {
    _id: '',
    teamId: '',
    org: '',
    firstName: '',
    lastName: '',
    email: '',
    emailVerified: false,
    teamAdmin: false,
    appAdmin: false,
    orgAdmin: false,
    userType: 'individualContributor',
    uid: '',
    userStatus: 'pending',
    trainingStatus: 'none',
    profilePicUrl: '',
    supervisorId: null,
    directReports: [],
    settings: {},
    jobTitle: ''
  }
  message: TemplateMessageModel;
  userIdSelected = '';
  matchingJobTitles: string[] = [];
  matchingUsers: string[] = [];
  matchingSupervisors: string[] = [];
  uid: string;
  teamTrainings: TrainingModel[] = [];
  userPanelVisible = false;
  newUser = false;
  selectedTrainingId = null;
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  newUsers: UserBatchData[] = [];
  supervisorHash = {};
  userNameHash = {};
  authenticatedUserFullName;
  usersNotOnMyTeam: string[] = [];
  showNone = true;
  showUpToDate = true;
  showPastDue = true;
  showIndividualContributors = true;
  showSupervisors = true;
  showVolunteers = true;
  showCustomers = true;
  showUpToDateTrainings = true;
  showCompletedTrainings = true;
  showPastDueTrainings = true;
  showOnetime = true;
  showRecurring = true;
  uidUTHash$: Observable<UidUTHash>;
  uidUTHash = {};
  showTrainingHash = {};
  trainingStatusFilterVal: string;
  myGroup: UserModel[];
  teamContainerWidth = 25;
  browserWidth;
  browserHeight;
  newWidth;
  resizeBarColor;
  dragging;
  bulkUploadCount = 0;
  fullNameHash = {};
  newUserHash = {};
  newUserIds = [];
  org;
  teamId;
  nodes: OrgChartNode[] = [];
  directReports: OrgChartNode[][][][];
  directReports$: Observable<OrgChartNode[][][][]>;
  chartOrientation = 'vertical';
  orgChartFontSize = 2;
  reportChain: string[] = [];
  orgNodeHash = {};
  uidReportChainHash = {};
  orgChartHeight;
  currentTab = 0;
  tourStepsHash = {};
  bulkAdd = false;
  orgProgress: BuildOrgProgress = {
    usersTotal: 0,
    usersAdded: 0,
    description: '',
    usersProcessed: 0,
    supervisorMatchFail: []
  }
  myOrgUserNameHash = {};
  userNameToSearchFor: string;
  showAddToUserListButton = false;
  invalidSupervisorName = true;
  supervisorName;
  supervisorChanged = false;
  showSupervisorAssignmentDialog = false;
  supervisorMatchFails: string[] = [];
  supervisorsFixedCnt = 0;
  bulkAddFail = false;
  myOrgUsers$: Observable<string[]>;
  reportChainWidth = 0;
  orgChartWidth = 0;
  emailUnique = false;
  userFail$: Observable<UserFail>;
  /*
  orgChartContainerSize: 'small' | 'medium' | 'large';
  peopleCntArray = [];
  peopleCntArrayIndex;
  peopleCntHash = {
    small: [3, 8, 13, 18, 23, 28, 33, 38, 43, 45],
    medium: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48],
    large: [8, 13, 18, 23, 28, 33, 38, 43, 48, 53]
  }
  */
  batchFails$: Observable<UserBatchData[]>;
  batchFails = [];
  orgSize = 100;
  usersPerTeam = 5;
  currentHoverUid = '';
  currentHoverReportChain = [];
  currentSelectedReportChain = [];
  allActive = false;
  orgChartNodeHash = {};
  orgChartFullscreen = false;
  iconFontSize = 18;
  textFontSize = 8;
  orgChartPadding = 0;
  showOrgChart = 'true';
  userTrainings: UserTrainingModel[];
  listOfSupervisors = [];
  listOfTrainingStatus = [{ text: 'No Trainings', value: 'none' }, { text: 'Past Due', value: 'pastDue' }, { text: 'In Progress', value: 'upToDate' }];
  listOfUserTypes = [{ text: 'Individual Contributor', value: 'individualContributor' }, { text: 'Supervisor', value: 'supervisor' }, { text: 'Volunteer', value: 'volunteer' }, { text: 'Customer', value: 'customer ' }];
  listOfSearchTrainingStatus: string[] = [];
  listOfSearchUserTypes: string[] = [];
  listOfSearchSupervisors: string[] = [];
  userListDisplay: UserModel[];
  hoverUid;
  rowSelected = 0;
  showTeam = 'false';
  userList: UserModel[];
  sortName: string | null = null;
  sortValue: string | null = null;

  nameList = [
    "Lakendra Englert  ",
    "Lily Rivera  ",
    "Hertha Mumper  ",
    "Claris Murdock  ",
    "Hedy Thiem  ",
    "Shirleen Elamin  ",
    "Kizzy Kerley  ",
    "Kacy Dorough  ",
    "Brunilda Amick  ",
    "Samatha Stigall  ",
    "Latoria Beam  ",
    "Carolyn Hibbs  ",
    "Darrel Poitras  ",
    "Mariela Consolini  ",
    "Yong Auerbach  ",
    "Deana Depalma  ",
    "Dian Eppler  ",
    "Marcellus Mcgary  ",
    "Marybelle Mikelson  ",
    "Carolee Ishee  ",
    "Glenna Esquer  ",
    "Lilia Straub  ",
    "Claude Quiroz  ",
    "Dorthea Bradsher  ",
    "Danyel Raminez  ",
    "Homer Poppe  ",
    "Carmon Seyler  ",
    "Ivey Houchin  ",
    "Emilia Dittmar  ",
    "Beatris Callihan  ",
    "Elma Lauritsen  ",
    "Miguelina Levitt  ",
    "Dorris Inskeep  ",
    "Amada Pascarelli  ",
    "Kris Gulino  ",
    "Sanjuanita Rehberg  ",
    "Terri Quinteros  ",
    "Khalilah James  ",
    "Arthur Alberts  ",
    "Polly Diggs  ",
    "Tennille Thies  ",
    "Hilary Meltzer  ",
    "Danilo Charbonneau  ",
    "Ramonita Estrella  ",
    "Jeanna Wilburn  ",
    "Maxima Majka  ",
    "Tyrone Grosvenor  ",
    "Terrilyn Morissette  ",
    "Janie Duford  ",
    "Vannessa Goe",
    "Arielle Rudder  ",
    "Shawanna Lamore  ",
    "Wilbur Flick  ",
    "Blake Fred  ",
    "Tresa Shuck  ",
    "Meridith Younkin  ",
    "Malena Malatesta  ",
    "Genie Dionne  ",
    "Lucia Stouffer  ",
    "Moises Gerke  ",
    "Bunny Bortz  ",
    "Tilda Germany  ",
    "Isis Au  ",
    "Lourdes Kraushaar  ",
    "Roseanne Mccollister  ",
    "Kathi Yan  ",
    "Abbey Angle  ",
    "Julissa Wehner  ",
    "Amira Keely  ",
    "Melony Leamon  ",
    "Sheryl Kugler  ",
    "Debrah Mailman  ",
    "Ilona Mcnabb  ",
    "Hollie Connolly  ",
    "Candance Billington  ",
    "Trinidad Rackley  ",
    "Jacinta Foster  ",
    "Corine Moffett  ",
    "Erlene Grimmer  ",
    "Shelia Acquaviva  ",
    "Elli Hersh  ",
    "Kerstin Belisle  ",
    "Rolf Dingess  ",
    "Kacie Casella  ",
    "Hee Rippey  ",
    "Silas Bonnett  ",
    "Davis Papas  ",
    "Marianne Truman  ",
    "Huey Ramsay  ",
    "Janene Dorantes  ",
    "Patricia Archambeault  ",
    "Hailey Wimmer  ",
    "Ellen Izzi  ",
    "Blossom Giles  ",
    "Maribel Freiberg  ",
    "Summer Cue  ",
    "Laquanda Bellefeuille  ",
    "Silvia Dohrmann  ",
    "Luvenia Hulme  ",
    "Luana Chow ",
    "Karren Disney  ",
    "Rolanda Hurlbert  ",
    "Shameka Hobson  ",
    "Carolyn Macinnis  ",
    "Natashia Kamen  ",
    "Veronique Denny  ",
    "Ellsworth Mader  ",
    "Dustin Mcfarren  ",
    "Allena Figueredo  ",
    "Twila Staggers  ",
    "Chin Labriola  ",
    "Vera Bachelder  ",
    "Cathy Reidhead  ",
    "Sherryl Heishman  ",
    "German Byrnes  ",
    "Maira Blish  ",
    "Shonna Pellerin  ",
    "Russell Vogus  ",
    "Fairy Acosta  ",
    "Daniela Holcomb  ",
    "Patria Hom  ",
    "Dannette Coffin  ",
    "Annabel Alvarado  ",
    "Chong Mcgilvray  ",
    "Gloria Augustin  ",
    "Lissa Sassman  ",
    "Maragaret Palmatier  ",
    "Kandace Kahl  ",
    "Lisbeth Mattinson  ",
    "Tabitha Hayashi  ",
    "Jacquelin Hobaugh  ",
    "Renate Lavelle  ",
    "Krystina Gregerson  ",
    "Loida Gunnell  ",
    "Norine Stocks  ",
    "Percy Stops  ",
    "Dona Bullis  ",
    "Bette Matteson  ",
    "Nia Marriner  ",
    "Sherise Janelle  ",
    "Darcel Chastain  ",
    "Georgene Lague  ",
    "Naoma Escareno  ",
    "Emeline Greenwalt  ",
    "Sherice Tamayo  ",
    "Jong Bushell  ",
    "Deane Dagenais  ",
    "Raisa Fadden  ",
    "Winifred Froman  ",
    "Anastacia Volkert  ",
    "Philip Miguel  ",
    "Samatha Tebbs  ",
    "Qiana Kozel  ",
    "Valentina Woodburn  ",
    "Melony Kilburn  ",
    "Katia Waldrop  ",
    "Winona Curren  ",
    "Ollie Segawa  ",
    "Roberta Rutigliano  ",
    "Gracia Kilkenny  ",
    "Darby Soukup  ",
    "Lena Toothaker  ",
    "Inell Frahm  ",
    "Antone Tooker  ",
    "Pamelia Pickford  ",
    "Iluminada Barber  ",
    "Lilla Delorey  ",
    "Renae Reina  ",
    "Nereida Fallin  ",
    "Xiao Gumbs  ",
    "Abe Rodenberg  ",
    "Willy Mcanally  ",
    "Ena Bohn  ",
    "Shaniqua Ceasar  ",
    "Edmond Suen  ",
    "Reatha Foos  ",
    "Santa Kaya  ",
    "Easter Doolittle  ",
    "Candice Fleischmann  ",
    "Sharilyn Wolters  ",
    "Marcelina Loe  ",
    "Jani Grissom  ",
    "Nikia Abbey  ",
    "Milagro Northcutt  ",
    "Gwenda Carra  ",
    "Kathern Letsinger  ",
    "Christena Mcsherry  ",
    "Annelle Easterwood  ",
    "Vincenza Greer  ",
    "Nohemi Milo  ",
    "Agueda Kroenke  ",
    "Leisa Heald  ",
    "Deana Pariseau  ",
    "Kenny Maltby  ",
    "Johnette Saxton  ",
    "Teodora Rado  ",
    "Jennefer Radice  ",
    "Linette Fruchter  ",
    "Margarita Blough  ",
    "Enoch Ruano  ",
    "Nubia Gurney  ",
    "Julissa Bischof  ",
    "Robyn Guajardo  ",
    "Lynsey Skillings  ",
    "Stefania Engelking  ",
    "Berry Casto  ",
    "Maxie Slape  ",
    "Chau Turcios  ",
    "Garret Milan  ",
    "Elden Minier  ",
    "Kristin Morse  ",
    "Un Sim  ",
    "Zaida Dingus  ",
    "Rosella Auston  ",
    "Janee Tiernan  ",
    "Modesta Garriott  ",
    "Marget Henault  ",
    "Newton Eisner  ",
    "Caitlyn Belisle  ",
    "Genevieve Gooch  ",
    "Sabrina Hesse  ",
    "Darci Vanalstyne  ",
    "Etsuko Kerekes  ",
    "Forrest Vann  ",
    "Chanda Prescott  ",
    "Tiffaney Marton  ",
    "Jade Flippin  ",
    "Cortney Sutterfield  ",
    "Beryl Baltz  ",
    "Nu Peguero  ",
    "Johnna Mcelveen  ",
    "Mickey Canfield  ",
    "Christa Quackenbush  ",
    "Lauryn Smartt  ",
    "Doloris Artrip  ",
    "Neoma Reulet  ",
    "Hye Kutz  ",
    "Shalanda Deems  ",
    "Lela Declue  ",
    "Magdalena Vasquez  ",
    "Nova Swinehart  ",
    "Tajuana Leinen  ",
    "Aracely Cusack  ",
    "Melaine Weisberg  ",
    "Cruz Thompkins  ",
    "Rubin Madding  ",
    "Lara Peil  ",
    "Tracee Padula  ",
    "Eunice Istre  ",
    "Candida Rancourt ",
    "Sheena Heth  ",
    "Keva Mayle  ",
    "Johanne Hornung  ",
    "Buford Emily  ",
    "Arlinda Elza  ",
    "Maureen Franke  ",
    "Verlene Dundas  ",
    "Leanna Duhe  ",
    "Stormy Dunlop  ",
    "Jennine Then  ",
    "Sherwood Stokely  ",
    "Vicki Sidwell  ",
    "Teena Bame  ",
    "Nita Imler  ",
    "Nana Fitting  ",
    "Samantha Haas  ",
    "Lakiesha Lopresti  ",
    "Jonah Ecklund  ",
    "Nilda Crossett  ",
    "Yang Moisan  ",
    "Arielle Gatlin  ",
    "Donna Priestly  ",
    "Geri Harshman  ",
    "Azucena Zuk  ",
    "Sanda Bonneau  ",
    "Ji Goers  ",
    "Gigi Toenjes  ",
    "Shawanda Hafley  ",
    "Felisha Caplinger  ",
    "Carole Alex  ",
    "Everette Maize  ",
    "Augustine Reuben  ",
    "Todd Manges  ",
    "Landon Welles  ",
    "Lana Hadnot  ",
    "Ida Hasse  ",
    "Tomeka Nickols  ",
    "Felicitas Braswell  ",
    "Shemeka Dixion  ",
    "Charita Corker  ",
    "Nakita Stiverson  ",
    "Regenia Berthiaume  ",
    "Kristina Drain  ",
    "Qiana Mauk  ",
    "Darcie Due  ",
    "Deetta Rosenbloom  ",
    "Aron Slocum  ",
    "Griselda Colvard  ",
    "Rosa Pesqueira  ",
    "James Slevin  ",
    "Thad Maser  ",
    "Ginger Carvajal  ",
    "Armanda Hauck  ",
    "Jess Morain  ",
    "Tu Carbonneau  ",
    "Carla Camper  ",
    "Devora Lorch  ",
    "Catarina Cieslak  ",
    "Caleb Theel  ",
    "Jeffrey Booth  ",
    "Dewey Thatcher  ",
    "Ross Christo  ",
    "Berna Gravely  ",
    "Keitha Mraz  ",
    "Mark Jessop  ",
    "Yolando Mccullum  ",
    "Kanisha Bristow  ",
    "Paz Artiaga  ",
    "Maybell Lynes  ",
    "Vannessa Broussard  ",
    "Shawnda Lindquist  ",
    "Joana Kohut  ",
    "Dalila Stanbery  ",
    "Gertie Hageman  ",
    "Jeraldine Baskins  ",
    "Sylvie Harkleroad  ",
    "Tabitha Hinrichs  ",
    "Johna Hammer  ",
    "Bertha Schendel  ",
    "Merri Rosso  ",
    "Aletha Zehner  ",
    "Charlette Yamaguchi  ",
    "Tom Carollo  ",
    "Noella Scherf  ",
    "Anton Loveland  ",
    "Lou Heaton  ",
    "Sharmaine Ocana  ",
    "Rolanda Deshong  ",
    "Zachery Bell  ",
    "Jolynn Givens  ",
    "Dina Slay  ",
    "Antony Negley  ",
    "Drew Barrick  ",
    "Rochel Freyer  ",
    "Lacie Hallberg  ",
    "Arlinda Scaglione  ",
    "Aleta Chenier  ",
    "Inell Rehm  ",
    "Marivel Polhemus  ",
    "Norene Quail  ",
    "Willy Hults  ",
    "Jasper Shope  ",
    "Tamie Gutter  ",
    "Alfreda Berlanga  ",
    "Bettie Haverland  ",
    "Angella Faye  ",
    "Christi Gholston  ",
    "Elsy Couturier  ",
    "Scotty Markel  ",
    "Elke Weisner  ",
    "Vernita Ledet  ",
    "Arlena Elzy  ",
    "Hermine Keagle  ",
    "Rosenda Devries  ",
    "Vania Marcos  ",
    "Marietta Lofland  ",
    "Reginia Kovach  ",
    "Pa Humphery  ",
    "Miki Norton  ",
    "Kit Gatlin  ",
    "Marget Cliff  ",
    "Yetta Havard  ",
    "Caron Yun  ",
    "Sharyn Benford  ",
    "Tiffanie Pleas  ",
    "Tonja Hague  ",
    "Benito Slade  ",
    "Melodi Heger  ",
    "Una Houtz  ",
    "Lorina Leedom  ",
    "Ingeborg Telles  ",
    "Florencio Bucklin  ",
    "Retha Lieb  ",
    "Chasidy Toy  ",
    "Lashandra Rumbaugh  ",
    "Ariane Muncie  ",
    "Vince Barile  ",
    "Lianne Kidder  ",
    "Burton Wait  ",
    "Ocie Ruiz  ",
    "Kimiko Mccollister  ",
    "Tiffany Falconer  ",
    "Glen Rinaldo  ",
    "Barb Rhoten  ",
    "Genevie Neidig  ",
    "Miles Soto  ",
    "Myriam Lauderdale  ",
    "Dovie Allsop  ",
    "Michal Sher  ",
    "Delicia Grissett "];

  orgJobTitles = [];
  testNodes = <{ firstName: string, lastName: string, email: string, jobTitle: string, supervisorName: string, drList: any[] }[]>[];
  maxLevel = 5;
  maxLevelSummary = false;
  includeFullName = true;
  useMaxWidth = true;
  test = true;
  userMin = 2;
  userMax = 6;
  uidUTStatHash = {};
  usersCSV = '';

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private mailService: SendmailService,
    private trainingService: TrainingService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private joyrideService: JoyrideService,
    private messageService: NzMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
    this.directReports$ = this.userService.getDirectReportsStream();
    this.batchFails$ = this.userService.getBatchUserFailsStream();
    this.userFail$ = this.userService.getUserFailStream();
    this.myOrgUsers$ = this.userService.getMyOrgUserNameListStream();
    this.buildOrgProgress$ = this.userService.getOrgProgressStream();
    this.uidReportChainHash$ = this.userService.getUIDReportChainHashStream();
    this.myOrgChartData$ = this.userService.getMyOrgStream();
    this.myOrgUserHash$ = this.userService.getOrgHashStream();
    this.uidUTHash$ = this.userTrainingService.getUidUTHashStream();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.myTeam$ = this.userService.getMyTeamStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.newUser$ = this.userService.getNewUserStream();
    this.jobTitles$ = this.jobTitleService.getJobTitleStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
  }

  ngOnInit() {

    for (let i = 0; i < this.maxLevel; i++) {
      if (i === this.maxLevel - 1) {
        this.orgJobTitles[i] = [
          'lifeguard',
          'front desk',
          'programmer',
          'admin',
          'coordinator',
          'project manager'
        ];
      } else {
        this.orgJobTitles[i] = ['foo'];
      }
    }


    this.userList = [];
    this.tourStepsHash['myTeam'] = ['Step1-myTeam', 'Step2-myTeam', 'Step3-myTeam', 'Step4-myTeam', 'Step5-myTeam'];
    this.tourStepsHash['memberDetails'] = ['Step1-memberDetails'];
    this.tourStepsHash['orgChart'] = ['Step1-orgChart'];


    this.contentHeight = Math.floor((window.innerHeight - (.3 * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    FlatfileImporter.setVersion(2);
    this.initializeImporter();
    this.batchFails$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(failList => {
      if (!failList) {
        return;
      }

      this.batchFails = failList;
    });
    this.directReports$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(directReports => {
      if (!directReports) {
        return;
      }

      this.directReports = directReports;
      for (let dr of this.directReports) {
        if (dr) {
          for (let level of dr) {
            if (level) {
              for (let team of level) {
                if (team) {
                  for (let node of team) {
                    this.orgChartNodeHash[node.extra.uid] = node;
                  }
                }
              }
            }
          }
        }
      }
    });

    this.buildOrgProgress$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgProgress => {
      if (!orgProgress) {
        return;
      }
      this.bulkAdd = true;
      console.log('Org Progress', orgProgress);
      this.orgProgress = orgProgress;
      if (orgProgress.usersProcessed === orgProgress.usersTotal && orgProgress.supervisorMatchFail.length > 0) {
        this.supervisorMatchFails = orgProgress.supervisorMatchFail;
      }
    });

    this.myOrgUserHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgUserHash => {
      if (!orgUserHash) {
        return;
      }
      this.myOrgUserHash = orgUserHash;
      this.myOrgUserObjs = Object.values(this.myOrgUserHash);
      this.userList = this.myOrgUserObjs;
      this.userListDisplay = [...this.userList];
      this.myOrgSupervisors = [];
      let bulkAddFailFound = false;
      let listOfSupervisorIds = [];
      for (let user of this.myOrgUserObjs) {
        if (!user.supervisorId) {
          continue;
        }
        this.myOrgUserNameHash[user.firstName + ' ' + user.lastName] = user;
        if (listOfSupervisorIds.indexOf(user.supervisorId) < 0) {
          this.listOfSupervisors.push({ text: this.myOrgUserHash[user.supervisorId]?.firstName + ' ' + this.myOrgUserHash[user.supervisorId]?.lastName, value: user.supervisorId });
          listOfSupervisorIds.push(user.supervisorId);
        }
        //        this.supervisorIdNameHash[user.supervisorId]
        if (user.userStatus === 'duplicate-email') {
          bulkAddFailFound = true;
          this.bulkAddFail = true;
        }
        if (user.userType === 'supervisor') {
          this.myOrgSupervisors.push(user.firstName + ' ' + user.lastName);
        }
      }
      console.log('listOfSupervisors', this.listOfSupervisors);
      this.matchingSupervisors = this.myOrgSupervisors;
    });
    this.myOrgUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myOrgUsers => {
      if (!myOrgUsers) {
        return;
      }
      this.myOrgUsers = myOrgUsers;
      this.matchingUsers = this.myOrgUsers;
    });
    this.uidReportChainHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidReportChainHash => {
      if (!uidReportChainHash) {
        return;
      }
      this.uidReportChainHash = uidReportChainHash;
    });
    this.uidUTHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUTHash => {
      if (!uidUTHash) {
        return;
      }
      this.uidUTHash = uidUTHash;
      /*
      let uids = Object.keys(this.uidUTHash);
      for (let uid of uids) {
        let userTrainings = this.uidUTHash[uid];
        let uidUTStat = { none: 0, upToDate: 0, pastDue: 0 };
        for (let ut of userTrainings) {
          if (ut.status)
        }
      }
      */
    });
    this.myOrgChartData$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(nodes => {
      if (!nodes) {
        return;
      }

      // this next bit of code tries to set the org chart font size to a reasponable value for the
      // number of people in the chart

      this.nodes = nodes;
    });
    this.myTeam$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userList => {
      console.log('myTeam$  ', userList);
      if (!userList) {
        return;
      }
      //      this.myGroup = userList;
      this.myTeam = userList;
      let teamIdHash = {};

      for (let teamMember of this.myTeam) {
        this.userTrainingService.initUserTrainingsForUser(teamMember._id);
      }

    });

    this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;
    });

    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        this.userIdSelected = null;
        return;
      }
      this.userIdSelected = user._id;

      this.selectedUser = user;
      if ((user.supervisorId && this.myOrgUserHash[user.supervisorId]) && (this.authenticatedUser && user._id !== this.authenticatedUser._id)) {
        this.supervisorName = this.myOrgUserHash[user.supervisorId].firstName + ' ' + this.myOrgUserHash[user.supervisorId].lastName;
      }
      this.reportChain = Object.assign([], this.uidReportChainHash[this.selectedUser._id]);
      this.trainingService.selectTraining(null);
      if (this.orgChartNodeHash[this.userIdSelected]) {
        this.currentSelectedReportChain = this.orgChartNodeHash[this.userIdSelected].extra.reportChain;
      }
      if (this.authenticatedUser) {
        this.userService.buildOrgChart(this.authenticatedUser._id, false);
      }
    });

    this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      if (!userTrainings) {
        return;
      }
      this.assignableTrainings = [];
      let tids = [];
      let pastDueFound = false;
      for (let ut of userTrainings) {
        tids.push(ut.tid);
      }

      for (let training of this.teamTrainings) {
        if (tids.includes(training._id)) {
          continue;
        } else {
          if (training.versions.length < 2) {
            continue;
          }
          this.assignableTrainings.push(training);
        }
      }

    });

    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
      this.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
      this.teamId = this.authenticatedUser._id;
      this.authenticatedUserFullName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
      this.importer.setCustomer({
        userId: this.authenticatedUser._id,
        name: this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName
      });


      this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.uid = params.get('uid');
        if (!this.uid) {
          this.uid = this.authenticatedUser._id;
        }
        this.userService.selectUser(this.uid);
      });
      //      this.selectUser(this.authenticatedUser._id);
      this.assignableTrainings = [];

      this.allTrainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(allTrainingIdHash => {
        this.allTrainingIdHash = allTrainingIdHash;
        let trainings = Object.values(this.allTrainingIdHash);
        this.teamTrainings = [];
        for (let training of trainings) {
          if (training.teamId === this.authenticatedUser.uid) {
            this.teamTrainings.push(training);
            this.showTrainingHash[training._id] = training
          }
        }
      })
    })

    this.jobTitles$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobTitles => {
      this.jobTitles = jobTitles;
      this.matchingJobTitles = this.jobTitles;
    })

    this.userFail$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userFail => {

    })
  }

  resendRegistrationMsg(to: string, from: string) {
    this.userService.sendRegistrationMsg(to, from);
    let msg = 'Registration messasge resent.';
    this.createBasicMessage(msg);
  }

  createBasicMessage(msg: string) {
    this.messageService.info(msg);
  }

  createCSV() {
    for (let user of this.newUsers) {
      this.usersCSV += user.firstName + ',' + user.lastName + ',' + user.email + ',' + user.jobTitle + ',' + user.supervisorName + '\n';
    }
  }

  zoomIn() {
    this.iconFontSize += 1;
    this.textFontSize += 1;
//    this.orgChartPadding += 1;
  }

  zoomOut() {
    if (this.iconFontSize > 2) {
      this.iconFontSize -= 1;
    }
    if (this.textFontSize > 2) {
      this.textFontSize -= 1;
    }
//    if (this.orgChartPadding > 0) {
//      this.orgChartPadding -= 1;
//    }
  }

  filterMyTeam(listOfSupervisors) {
    this.listOfSearchSupervisors = listOfSupervisors;
    this.search();
  }

  filterTrainingStatus(listOfSearchTrainingStatus: string[]): void {
    this.listOfSearchTrainingStatus = listOfSearchTrainingStatus;
    this.search();
  }

  filterUserType(listOfSearchUserTypes: string[]): void {
    this.listOfSearchUserTypes = listOfSearchUserTypes;
    this.search();
    this.rowSelected = this.userListDisplay.indexOf(this.selectedUser, 0);
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }

  search(): void {
    const filterFunc = (item: UserModel) =>
      (this.listOfSearchTrainingStatus.length ? this.listOfSearchTrainingStatus.some(trainingStatus => item.trainingStatus === trainingStatus) : true) &&
      (this.listOfSearchUserTypes.length ? this.listOfSearchUserTypes.some(userType => item.userType === userType) : true) &&
      (this.listOfSearchSupervisors.length ? this.listOfSearchSupervisors.some(supervisorId => item.supervisorId === supervisorId) : true)
    const data = this.userList.filter(item => filterFunc(item));

    if (this.sortName && this.sortValue) {
      this.userListDisplay = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
    } else {
      this.userListDisplay = data;
    }


//    this.userListDisplay = data;
  }

  toggleMainView(showOrg) {
    if (showOrg === 'false') {
      this.rowSelected = this.userListDisplay.indexOf(this.selectedUser, 0);
    }
  }

  deleteAllUsers() {

  }

  testBulkAdd() {
    let currentSupervisorName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
    let supervisorCnt = 1;
    let name: string = this.getTestUser();
    let fullName: string[] = name.trim().split(' ');
    let level = 1;
    let jobTitleIndex = 0;
    let node = {
      firstName: fullName[0],
      lastName: fullName[1],
      email: 'greg@test.com',
      jobTitle: this.orgJobTitles[level][jobTitleIndex],
      supervisorName: currentSupervisorName,
      drList: []
    }

    let teamSize = Math.floor(this.randn_bm(this.userMin, this.userMax, 1));
    if (teamSize > 9) {
      teamSize = 9;
    }
    for (let i = 0; i < teamSize; i++) {
      let childNode = this.buildNode(currentSupervisorName, level);
      node.drList.push(childNode);
      this.testNodes.push(childNode);
    }

    this.testNodes.push(node);
    this.newUsers = this.testNodes;

    this.userService.createNewUsersFromBatch(this.newUsers, true);
  }


  buildNode(supervisorName: string, level: number): { firstName: string, lastName: string, email: string, jobTitle: string, supervisorName: string, drList: any[] } {
    let name: string;
    if (this.nameList.length === 0) {
      name = String(new Date().getTime()) + ' ' + String(new Date().getTime());
    } else {
      name = this.getTestUser();
    }

    let fullName: string[] = name.trim().split(' ');
    let jobTitle: string;

    let jobTitleIndex = 0;
    if (level === 5) {
      jobTitleIndex = Math.floor(Math.random() * Math.floor(this.orgJobTitles.length));
    }
    let node = {
      firstName: fullName[0],
      lastName: fullName[1],
      email: 'greg@test.com',
      jobTitle: this.orgJobTitles[level][jobTitleIndex],
      supervisorName: supervisorName,
      drList: []
    }
    level++;
    if (level < this.maxLevel) {
      if (Math.random() < .7) {
        node.drList = [];
        let teamSize = Math.floor(this.randn_bm(this.userMin, this.userMax, 1));

        if (teamSize > 6) {
          teamSize = 6;
        }
        for (let i = 0; i < teamSize; i++) {
          let childNode = this.buildNode(fullName[0] + ' ' + fullName[1], level);
          node.drList.push(childNode);
          this.testNodes.push(childNode);
        }
      }
    }
    return node;
  }

  getTestUser(): string {
    let nameListSize = this.nameList.length;
    let index = Math.floor(Math.random() * Math.floor(nameListSize));
    let names: string[] = this.nameList.splice(index, 1);
    return names[0];
  }

  randn_bm = (min: number, max: number, skew: number): number => {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = this.randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
  }
  increaseFontSize() {
    this.orgChartFontSize += 1;
  }
  decreaseFontSize() {
    this.orgChartFontSize -= 1;
  }
  showOrgChartFunc(value) {
    this.showOrgChart = value;
  }

  setHoverData(uid: string) {
    if (!uid) {
      this.currentHoverUid = '';
      this.currentHoverReportChain = [];
      return;
    }
    this.currentHoverUid = uid;
    this.currentHoverReportChain = this.orgChartNodeHash[uid].extra.reportChain;
  }

  setAuthenticatedUserHover(allActive: boolean) {
    if (allActive) {
      this.currentHoverUid = this.authenticatedUser._id;
      this.allActive = true;
    } else {
      this.currentHoverUid = '';
      this.allActive = false;
    }
  }

  checkUniqueEmail(data) {
    if (!this.selectedUser.email || this.selectedUser.email === '') {
      this.emailUnique = false;
      return;
    }
    console.log('checkUniqueEmail', data);
    this.userService.getUserByEmail(this.selectedUser.email).subscribe(user => {
      this.emailUnique = false;
    },
      err => {
        this.emailUnique = true;
      })
  }

  selectReportChainItem(uid) {
    this.reportChain = this.uidReportChainHash[uid];
    if (this.reportChain && this.reportChain.length < 1) {
      this.reportChain = null;
    }
    this.userService.buildOrgChart(uid, true);
  }

  selectNode(event) {
    this.reportChain = Object.assign([], this.uidReportChainHash[event.extra.uid]);
    //    this.userService.buildOrgChart(event.extra.uid, true);
    //    console.log('selectNode', event);
  }

  toggleFilter(filter: string) {

    if (filter === 'up-to-date') {
      this.showUpToDate = !this.showUpToDate;
    } else if (filter === 'past-due') {
      this.showPastDue = !this.showPastDue;
    } else if (filter === 'none') {
      this.showNone = !this.showNone;
    } else if (filter === 'individual-contributor') {
      this.showIndividualContributors = !this.showIndividualContributors;
    } else if (filter === 'supervisor') {
      this.showSupervisors = !this.showSupervisors;
    } else if (filter === 'volunteer') {
      this.showVolunteers = !this.showVolunteers;
    } else if (filter === 'customer') {
      this.showCustomers = !this.showCustomers;
    } else if (filter === 'trainingUpToDate') {
      this.showUpToDateTrainings = !this.showUpToDateTrainings;
    } else if (filter === 'trainingCompleted') {
      this.showCompletedTrainings = !this.showCompletedTrainings;
    } else if (filter === 'trainingPastDue') {
      this.showPastDueTrainings = !this.showPastDueTrainings;
    } else if (filter === 'onetime') {
      this.showOnetime = !this.showOnetime;
    } else if (filter === 'recurring') {
      this.showRecurring = !this.showRecurring;
    }

  }

  async launchImporter() {
    try {

      let results = await this.importer.requestDataFromUser();
      this.importer.displayLoader();
      this.importer.displaySuccess("Success!");
      this.results = JSON.stringify(results.validData, null, 2);

      this.newUsers = JSON.parse(this.results);
      this.userService.createNewUsersFromBatch(this.newUsers, false);
      //        this.trainingService.assignTrainingsForJobTitle(this.newTeamMember.jobTitle, this.newTeamMember._id, this.newTeamMember.teamId);
      //        this.newUsers = [{ firstName: '', lastName: '', email: '', jobTitle: '', supervisorName: '' }];
    } catch (e) {
      console.info(e || "window close");
    }
  }


  initializeImporter() {
    this.importer = new FlatfileImporter(this.LICENSE_KEY, {
      fields: [
        {
          label: "First Name",
          key: "firstName",
          validators: [{ validate: "required" }]
        },
        {
          label: "Last Name",
          key: "lastName",
          validators: [{ validate: "required" }]
        },
        {
          label: "Email Address",
          key: "email",
          validators: [
            { validate: "required" },
            {
              validate: "regex_matches",
              regex:
                "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
              error: "Must be in email format"
            }
          ]
        },
        {
          label: "Job Title",
          key: "jobTitle",
          validators: []
        },
        {
          label: "Supervisor",
          key: "supervisorName",
          validators: []
        }
      ],
      type: "Users",
      allowInvalidSubmit: true,
      managed: true,
      allowCustom: true,
      disableManualInput: false
    });
  }

  setJobTitle(value) {
    this.jobTitleService.addJobTitle(this.newTeamMember.jobTitle);
    //    this.userService.updateUser(this.authenticatedUser, false);
  }

  onUserSearchChange(value: string): void {
    this.matchingUsers = this.myOrgUsers.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    let index = this.myOrgUsers.indexOf(value);
    if (index > -1) {
      this.selectUser(this.myOrgUserNameHash[value]._id, index);
      //      this.showAddToUserListButton = true;
    }
  }

  onSupervisorNameChange(value: string): void {
    this.matchingSupervisors = this.myOrgSupervisors.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    let userObj;
    if (this.myOrgSupervisors.indexOf(value) > -1) {
      this.invalidSupervisorName = false;
      this.supervisorChanged = true;
    } else {
      this.invalidSupervisorName = true;
    }
  }

  onJobTitleChange(value: string): void {
    this.matchingJobTitles = this.jobTitles.filter(jobTitle => jobTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  /*
    addFoundUser() {
      let userObj = this.myOrgUserNameHash[this.userNameToSearchFor];
      this.myTeam.push(userObj);
      this.myTeamIdHash[userObj._id] = userObj;
      this.showAddToUserListButton = false;
      this.currentTab = 0;
      this.userNameToSearchFor = '';
      this.matchingUsers = this.myOrgUsers;
      this.selectUser(userObj._id, -1);
    }
    */

  addUser() {
    this.newUser = true;
    this.newTeamMember._id = String(new Date().getTime());
    this.newTeamMember.uid = ''
    this.newTeamMember.org = this.org;
    this.newTeamMember.firstName = '';
    this.newTeamMember.lastName = '';
    this.newTeamMember.email = '';
    this.newTeamMember.emailVerified = false;
    this.newTeamMember.jobTitle = '';
    this.newTeamMember.teamId = this.teamId;
    this.newTeamMember.supervisorId = this.authenticatedUser._id;
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.userStatus = 'pending';
    this.newTeamMember.trainingStatus = 'none';
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.orgAdmin = false;
    this.newTeamMember.appAdmin = false;
    this.newTeamMember.profilePicUrl = '';
    this.newTeamMember.directReports = [];
    this.newTeamMember.settings = {
      themeColor: {
        name: 'grey',
        primary: 'white',
        secondary: '#999999',
        bgColor: '#e9e9e9',
      }
    };
    this.supervisorName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
    this.selectedUser = this.newTeamMember;
    this.userPanelVisible = true;
    this.options = [];
  }

  handleCancel(): void {
    if (this.newUser) {
      this.userService.selectUser(this.authenticatedUser._id);
      this.newUser = false;
    }
    this.emailUnique = false;
    this.userPanelVisible = false;
  }

  handleAddUser(reload: boolean) {
    this.newUser = false;

    this.userService.createNewUser(this.newTeamMember, reload);

    this.userPanelVisible = false;
  }


  handleUpdateUser() {
    this.userPanelVisible = false;
    let newSupervisorObj = this.myOrgUserNameHash[this.supervisorName];
    let currentSupervisorObj = this.myOrgUserHash[this.selectedUser.supervisorId];
    if (this.selectedUser.supervisorId !== newSupervisorObj._id) {
      this.selectedUser.supervisorId = newSupervisorObj._id;
      this.selectedUser.teamId = newSupervisorObj._id;
      newSupervisorObj.directReports.push(this.selectedUser._id);
      currentSupervisorObj.directReports.splice(currentSupervisorObj.directReports.indexOf(this.selectedUser._id), 1);
      this.myTeam.splice(this.myTeam.indexOf(this.selectedUser), 1);
      this.userService.updateUser(currentSupervisorObj, false);
      this.userService.updateUser(newSupervisorObj, false);
      if (newSupervisorObj._id === this.authenticatedUser._id) {
        this.myTeam.push(newSupervisorObj);
      }
    }
    this.userService.updateUser(this.selectedUser, false);
    this.userService.buildOrgChart(this.authenticatedUser._id, false);
  }

  isFirst(index) {
    if (index === 0) {
      return true;
    } else {
      return false;
    }
  }

  isLast(list, index) {
    if (index === list.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  selectUser(userId, i) {
    this.userService.selectUser(userId);
    this.rowSelected = i;
  }

  selectSupervisor() {
    this.selectUser(null, -1);
    this.supervisorSelected = true;
  }

  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
  }

  handleCancelUserTraining() {
    this.showUserTrainingModal = false;
    this.selectedTrainingId = null;
  }

  editUser() {
    this.userPanelVisible = true;
  }

  onInput(value: string): void {
    for (let jobTitle of this.jobTitles) {
      if (jobTitle.startsWith(value)) {
        if (!this.options.includes(jobTitle)) {
          this.options.push(jobTitle);
        }
      }
    }
  }

  confirmDelete(user: UserModel) {
    if (user._id === this.authenticatedUser._id) {
      return;
    }
    this.userService.deleteUser(user._id);
    this.userTrainingService.deleteUTForUser(user._id);
    this.userService.selectAuthenticatedUser();
  }

  handleAssignUserTraining() {
    if (!this.selectedTrainingId || this.assignableTrainings.length === 0) {
      this.showUserTrainingModal = false;
      return;
    }
    this.userTrainingService.assignTraining(this.userIdSelected, this.selectedTrainingId, this.authenticatedUser._id, this.allTrainingIdHash[this.selectedTrainingId].versions[0].version);

    if (this.selectedUser.trainingStatus === 'none') {
      this.selectedUser.trainingStatus = 'upToDate';
      this.userService.updateUser(this.selectedUser, false);
    }

    this.showUserTrainingModal = false;
    this.assignableTrainings.splice(this.assignableTrainings.indexOf(this.selectedTrainingId), 1);
    this.selectedTrainingId = null;
    this.userTrainingService.getUTForUser(this.userIdSelected);
  }

  onDragStart(event) {
    this.dragging = true;
    this.resizeBarColor = '#7fa9f9';
  }

  onDrag(event) {
    this.newWidth = Math.floor((event.clientX / window.innerWidth) * 100);
    this.teamContainerWidth = this.newWidth;
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    /*
    if (this.orgChartWidth < 800) {
      this.orgChartContainerSize = 'small';
    } else if (this.orgChartWidth < 900) {
      this.orgChartContainerSize = 'medium';
    } else {
      this.orgChartContainerSize = 'large';
    }
    this.peopleCntArray = this.peopleCntHash[this.orgChartContainerSize];
    */
  }

  onDragEnd(event) {
    this.resizeBarColor = 'white';
  }

  drop(event) {
  }

  allowDrop(event) {
    event.preventDefault();
  }

  startTour(section) {
    let steps = this.tourStepsHash[section];
    this.joyrideService.startTour({ steps: steps });
  }


}
