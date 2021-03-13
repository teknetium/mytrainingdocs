import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { ResizeEvent } from '../../shared/interfaces/event.type';
import { TrainingService } from '../../shared/services/training.service';
import { OrgService } from '../../shared/services/org.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TaskWizardService } from '../../shared/services/taskWizard.service';
import { TaskModel, TaskHash, TaskStepContentHash } from '../../shared/interfaces/task.type';
import { UserTrainingModel, UidUTHash, TidUTHash, UidTidUTHash } from '../../shared/interfaces/userTraining.type';
import { AlertModel } from '../../shared/interfaces/notification.type';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { Observable, BehaviorSubject, Subscription, defer, from, timer, } from 'rxjs';
import { UserModel, UserFail, UserIdHash, OrgChartNode, BuildOrgProgress, UserBatchData, NodeStat } from '../../shared/interfaces/user.type';
import { OrgModel } from '../../shared/interfaces/org.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MessageService } from '../../shared/services/message.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { MessageModel, TemplateMessageModel } from '../../shared/interfaces/message.type';
import { takeUntil, filter, scan, map, concatMap, share } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import { BaseComponent } from '../base.component';
import FlatfileImporter from "flatfile-csv-importer";
import { JoyrideService } from 'ngx-joyride';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { stringify } from 'querystring';
// import * as names from '../../../assets/names.json';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../shared/services/loader.service';
import html2canvas from 'html2canvas';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('legendSlide', [
      // ...
      state('closed', style({
        'margin-left': '-350px'
      })),
      state('open', style({
        'margin-left': '0',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('expandNode', [
      // ...
      state('collapsed', style({
        'width': '0',
        'height': "fit-content"
      })),
      state('expanded', style({
        'width': 'fit-content',
        'height': 'fit-content',
      })),
      transition('collapsed => expanded', [
        animate('1000ms')
      ]),
      transition('expanded => collapsed', [
        animate('1000ms')
      ])
    ]),
    trigger('searchSlide', [
      // ...
      state('open', style({
        'width': '300px',
        'margin-left': '-15px'
      })),
      state('closed', style({
        'width': '0',
        'margin-left': '-45px'
      })),
      transition('in => out', [
        animate('800ms')
      ]),
      transition('out => in', [
        animate('800ms')
      ])
    ]),
    trigger('flattenSearchIcon', [
      // ...
      state('open', style({
        'visibility': 'hidden',
        'height': '0'
      })),
      state('closed', style({
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
export class MyteamComponent extends BaseComponent implements OnInit, AfterViewInit {

  LICENSE_KEY = "2bda9380-a84c-11e7-8243-1d92e7c67d6d";
  results: string = "";
  browserInnerHeight: number;
  browserInnerWidth: number;
  contentHeight: number;
  contentWidth: number;


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
    none: 'fas fa-user',
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fas fa-fw fa-user-tie',
    volunteer: 'fas fa-fw fa-user-cowboy',
    customer: 'fas fa-fw fa-user-alien',
    contractor: 'fas fa-fw fa-user-hard-hat'
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
    none: 'black',
    completed: '#4891f7',
    pendingCertUpload: '#feb90b'
  }
  userStatusColorHash = {
    active: 'blue',
    inactive: '#aaaaaa',
    pending: '#feb90b',
    error: 'red'
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
  //  selectedUserId: string;
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
    userData: {},
    settings: {
      statusList: [],
      showCSV: false,
      themeColor: {},
      showLegend: true,
      showInactiveUsers: true,
      showAlerts: true,
      showTasks: true
    },
    jobTitle: ''
  }
  message: TemplateMessageModel;
  userIdSelected = '';
  userIdsSelected = [];
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
  chartOrientation = 'vertical';
  orgChartFontSize = 2;
  reportChain: string[] = [];
  orgNodeHash = {};
  uidReportChainHash = {};
  orgChartHeight;
  currentTab = 0;
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
  supervisorName: string;
  supervisorEmail: string;
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
  currentHoverUid = null;
  currentHoverReportChain = [];
  currentSelectedReportChain = [];
  allActive = false;
  orgChartNodeHash = {};
  orgChartFullscreen = false;
  iconFontSize = 16;
  textFontSize = 12;
  orgChartPadding = 1;
  showOrgChart = 'true';
  userTrainings: UserTrainingModel[];
  listOfJobTitles = [];
  listOfTrainingStatus = [{ text: 'No Trainings', value: 'none' }, { text: 'Past Due', value: 'pastDue' }, { text: 'In Progress', value: 'upToDate' }];
  listOfUserTypes = [{ text: 'Individual Contributor', value: 'individualContributor' }, { text: 'Supervisor', value: 'supervisor' }, { text: 'Volunteer', value: 'volunteer' }, { text: 'Customer', value: 'customer ' }];
  listOfUserStatus = [{ text: 'Pending', value: 'pending' }, { text: 'Activer', value: 'active' }, { text: 'Inactive', value: 'inactive' }];
  listOfSearchTrainingStatus: string[] = [];
  listOfSearchUserTypes: string[] = [];
  listOfSearchJobTitles: string[] = [];
  listOfSearchUserData1: string[] = [];
  userListDisplay: UserModel[] = [];
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
    "Delicia Grissett ",
    "Ruairidh Gunn",
    "Patrik Villarreal",
    "Kylo Shaw",
    "Elsie-Mae O'Brien",
    "Mahnoor Walmsley",
    "Remi Cottrell",
    "Akeel Spence",
    "Saarah Michael",
    "Arooj Daniels",
    "Harri Bryan",
    "Malika Connolly",
    "Fardeen Norton",
    "Joanne Bains",
    "Jordanna Britt",
    "Rachelle Soto",
    "Jasmin Barron",
    "Kalum Klein",
    "Rares Krause",
    "Kavan Jeffery",
    "Elana Figueroa",
    "Hawwa Mclellan",
    "Eric Rosas",
    "Xander Sheppard",
    "Ellie-Rose Greenwood",
    "Amiya Sellers",
    "Lucien Fowler",
    "Warwick Griffin",
    "Abdullah Mcdonnell",
    "Emile Peel",
    "Katlyn Booker",
    "Phebe Buckley",
    "Inara Bowen",
    "Demi-Leigh Forbes",
    "Ellisha Greenaway",
    "Ada York",
    "Joe Leblanc",
    "Haya Merrill",
    "Trey Aguilar",
    "Arman Smart",
    "Rubie Arias",
    "Humaira Barber",
    "Lani Deleon",
    "Amanda Payne",
    "Tina Davidson",
    "Zubair Woodley",
    "Cristiano Trujillo",
    "Lulu Dejesus",
    "Spencer Little",
    "Danny Bridges",
    "Teri Tomlinson",
    "Dotty Neal",
    "Reo Dowling",
    "Areeba Peterson",
    "Hasan Lees",
    "Mylah Buchanan",
    "Keenan Dickens",
    "Aneesha Spencer",
    "Massimo Reeves",
    "Kaison Lugo",
    "Leilani James",
    "Shoaib Gibson",
    "Rhonda Lindsay",
    "Emil Hardin",
    "Brittany Thomas",
    "Ameer Cabrera",
    "Eileen Irving",
    "Piers Sparrow",
    "Joey Gregory",
    "Gloria Gray",
    "Katerina Rhodes",
    "Jesus Olsen",
    "Everly Li",
    "Ahsan Garrett",
    "Shayna Kearns",
    "Brenda Jennings",
    "Lynden Markham",
    "Melissa Rivera",
    "Idrees Tapia",
    "Burhan Myers",
    "Armani Millington",
    "Martine Odling",
    "Daisy-Mae Young",
    "Samia Villegas",
    "Griffin Bate",
    "Joann Sheridan",
    "Ahmet Friedman",
    "Karla Ward",
    "Tasnia Dawson",
    "Iga Parker",
    "Ray Hill",
    "Ava-Mai Carson",
    "Johanna Harrell",
    "Campbell Berg",
    "Findlay Finley",
    "Hafsah Boyle",
    "Emre Mohammed",
    "Dainton Donnelly",
    "Scarlett-Rose Bennett",
    "Nicole Knight",
    "Waseem Roth",
    "Freyja Puckett",
    "Brittany Bate",
    "Aneeka Frey",
    "Caspian Wilkinson",
    "Austin Hood",
    "Imaan Lawson",
    "Storm Ochoa",
    "Anabia Burton",
    "Lucinda Burch",
    "Ishaaq Mcconnell",
    "Chester Hancock",
    "Adriana Leblanc",
    "Zack Rhodes",
    "Bear England",
    "Isaak Legge",
    "Alayah Abbott",
    "Glyn Holland",
    "Aaryan Salinas",
    "Atif Drummond",
    "Aaisha Dunlap",
    "Zidan Metcalfe",
    "Ava-Grace Ventura",
    "Roshni Morley",
    "Malachi Baldwin",
    "Sidrah Searle",
    "Zayyan Mayer",
    "Orlaith Garrison",
    "Albi Magana",
    "Rahim Davies",
    "Vienna Cote",
    "Ashleigh Whitney",
    "Alima King",
    "Sahar Davidson",
    "Patience Walters",
    "Lucas Knowles",
    "Angharad Maddox",
    "Priscilla Villanueva",
    "Joao Garrett",
    "Yasmeen Mansell",
    "Amaan Montgomery",
    "Nannie Guest",
    "Tim Howarth",
    "Jazmyn Cline",
    "Lainey Barton",
    "Bridget John",
    "Arissa Trevino",
    "Harriet Potter",
    "Pascal Sparks",
    "Eshaan Burrows",
    "Gracie Solomon",
    "Jia Palmer",
    "Frazer Clifford",
    "Murphy Flynn",
    "Grayson Kim",
    "Anabel Vasquez",
    "Danny Burris",
    "Emmie Carty",
    "Mya Hernandez",
    "Mary Horton",
    "Britney West",
    "Geoffrey Callaghan",
    "Md Saunders",
    "Milan Burnett",
    "Rodrigo Mohammed",
    "Khadija Hewitt",
    "Eddie Novak",
    "Keyaan Nguyen",
    "Hina Philip",
    "Faisal Peacock",
    "Yolanda Ramos",
    "Adnan Lucas",
    "Jay-Jay Beattie",
    "Mathilde Dejesus",
    "Janelle Povey",
    "Clive Wagner",
    "Layla-Rose Cameron",
    "Benedict Molina",
    "Ella-May Chadwick",
    "Lex Clarke",
    "Giovanni O'Gallagher",
    "Tyrone Bridges",
    "Alaya Crouch",
    "Eugene Copeland",
    "Suzanne Stanton",
    "Tracey Mohamed",
    "Ammar Ray",
    "Ilyas Justice",
    "Declan Everett",
    "Emily Reed",
    "Jannat Briggs",
    "Zachery George",
    "Penelope Scott",
    "Brendon Amin",
    "Rajan Downes",
    "Nathanial Vazquez",
    "Neive Woolley",
    "Jeanette Landry",
    "Richie Rodrigues",
    "Martyn Plant",
    "Lexie Mcknight",
    "Kelly Fritz",
    "Arron Stevens",
    "Isma Cope",
    "Alissa Robinson",
    "Yousuf Juarez",
    "Tilly Dodd",
    "Vienna Blevins",
    "Wanda Schmitt",
    "Zaki Spencer",
    "Delia Flower",
    "Rylan Arias",
    "Floyd Dolan",
    "Kiah Wheeler",
    "Inaayah Liu",
    "Mayur Dunlap",
    "Lyla-Rose Espinoza",
    "Marguerite Black",
    "Aarav Estes",
    "Manon Terrell",
    "Tymon Burke",
    "Anisha Ball",
    "Maha Noel",
    "Marianna Carney",
    "Geraldine Matthews",
    "Danyaal Wang",
    "Maxime Mccormack",
    "Keziah Scott",
    "Neha Pollard",
    "Jodi Wilkes",
    "Sade Donovan",
    "Adaline Estrada",
    "Daisy-Mae Meadows",
    "Ishaan Sparks",
    "Gurpreet Rosales",
    "Devon Handley",
    "Julian Robertson",
    "Ivy-Rose O'Brien",
    "Samiya Wilkins",
    "Lili May",
    "Jeremiah Corona",
    "Jevan O'Doherty",
    "Malcolm Underwood",
    "Mohamed Gough",
    "Lily-Anne Horton",
    "Aneurin Trujillo",
    "Gracie Lugo",
    "Korey Frank",
    "Shanna Sawyer",
    "Dennis Conroy",
    "Rares Andrade",
    "Mihai Long",
    "Tayla Hoffman",
    "Aryaan Anthony",
    "Ansh Nicholls",
    "Zaynab Krause",
    "Humza Middleton",
    "Oliver Fischer",
    "Yousif Mckay",
    "Matias Clark",
    "Rukhsar Drew",
    "Miya Hester",
    "Yassin Wagner",
    "Neil Maguire",
    "Kaydan Couch",
    "Gerard Lowry",
    "Greg Bowes",
    "Akshay Myers",
    "Portia Grant",
    "Darcey Blanchard",
    "Hasan Church",
    "Raj Stewart",
    "Georgiana Good",
    "Uzma Higgs",
    "Mohamad Harrell",
    "Humairaa Dodson",
    "Lillie Payne",
    "Sierra Taylor",
    "Myrtle Cordova",
    "Ioan Walmsley",
    "Anabel Broughton",
    "Woodrow Clayton",
    "Cristian Hebert",
    "Amelia-Grace Hogan",
    "Nathalie Mccray",
    "Angelo Beck",
    "Amani Saunders",
    "Mackenzie Moreno",
    "Jayden-James Walters",
    "Ariah Houghton",
    "Jun Benton",
    "Priyanka Bravo",
    "Luna Cummings",
    "Ozan Kirby",
    "Caspar Peters",
    "Stacie Hicks",
    "Dixie Ellison",
    "Eamon Simons",
    "Alaina Emerson",
    "Francis Curry",
    "Callum Amos",
    "Ayoub Randall",
    "Flora Hyde",
    "Isabel Macias",
    "Keenan Warner",
    "Samir Felix",
    "Sorcha Hardy",
    "Fahmida Shelton",
    "Olive Dunkley",
    "Ahyan Bowler",
    "Saniya Firth",
    "Nichola Berg",
    "Mitchel Pace",
    "Dru Cruz",
    "Vienna Rankin",
    "Aeryn Morris",
    "Olivia-Mae Gomez",
    "Macauley Martin",
    "Teodor Rich",
    "Diane Burt",
    "Isaac Woodward",
    "Lindsey Prentice",
    "Nabeel Choi",
    "Jiya Cantrell",
    "Padraig Ayala",
    "Ameen Benson",
    "Burhan Hopkins",
    "Ophelia Whitaker",
    "Delilah Shepherd",
    "Huw Jacobson",
    "Tegan Chaney",
    "Bobby Johns",
    "Richie Vickers",
    "Scott Webber",
    "Eli Watts",
    "Harvir Reid",
    "Ezmae Greene",
    "Elen Garrett",
    "Elliot Mays",
    "Gareth Hail",
    "Pola Lindsey",
    "Lauren Tate",
    "Yunus Carroll",
    "Reid Stott",
    "Anais Gale",
    "Ruby-May Khan",
    "T-Jay Blackwell",
    "Ellisha Decker",
    "Veer Broadhurst",
    "Suzanna Edge",
    "Sylvia Griffith",
    "Torin Galloway",
    "Tariq Mcconnell",
    "Isis Kearney",
    "Aleesha Hutton",
    "Hanifa Pena",
    "Krzysztof Bowden",
    "Dave Merritt",
    "Hubert Scott",
    "Husna Harrell",
    "Joe Caldwell",
    "Zaynah Kay",
    "Marcie Woodcock",
    "Libby Boyce",
    "Izabela Seymour",
    "Kirstie Charles",
    "Chelsy Daugherty",
    "Jocelyn Mckenna",
    "Jameel Kline",
    "Skye Workman",
    "Lucy Whyte",
    "Monet May",
    "Levi Macfarlane",
    "Blade Acosta",
    "John Frost",
    "Arvin Buck",
    "Ayyan Bonilla",
    "Kacie Dillon",
    "Mylie Washington",
    "Patricia Wharton",
    "Jevon O'Ryan",
    "Ritchie Atkinson",
    "Adelaide O'Moore",
    "Izabelle Lamb",
    "Josh Murray",
    "Luis Mcknight",
    "Giorgio Harrington",
    "Mark Hooper",
    "Devante Weiss",
    "Gideon Mccartney",
    "Lyle Gray",
    "Yehuda Hawes",
    "Kobe Holman",
    "Roxie Hays",
    "Clodagh Greaves",
    "Una Pearce",
    "Olivia Clifford",
    "Ruben Boyle",
    "Cali O'Connor",
    "Layla Gallagher",
    "Kaydee Henderson"];

  orgJobTitles = [];
  userTypes = [];
  selectionModeHash = {
    Individual: 'Individual',
    Org: 'Suborganization',
    JobTitle: 'Job Title',
    UserType: 'User Type',
    Training: 'Training',
    UserStatus: 'User Status'
  }
  userTypeHash = {
    individualContributor: 'Individual Contributor',
    supervisor: 'Supervisor',
    volunteer: 'Volunteer',
    contractor: 'Contractor',
    customer: 'Customer',
  };
  userStatusHash = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error'
  };

  testNodes = <UserBatchData[]>[];
  maxLevel = 0;

  maxLevelSummary = true;
  includeFullName = false;
  useMaxWidth = true;
  test = false;
  userMin = 5;
  userMax = 9;
  maxLevelUserMin = 3;
  maxLevelUserMax = 25;
  uidUTStatHash = {};
  usersCSV = '';
  bottomLevelWidth = 6;
  chartOrientationIsVertical = 'true';
  isVertical = true;
  false = false;
  userDetailIsVisible = false;
  isOrgView = true;
  listOfJobFilters: Array<{ label: string; value: string }> = [];
  listOfFilterJobTitles = [];
  currentJobTitleFilters = [];
  currentJobTitlesSelected = [];
  maxLevel$: Observable<number>;
  selectionMode = 'UserStatus';
  jobTitleMatchCnt = 0;
  currentUserType = 'none';
  currentUserStatus = 'none';
  currentUserDataError = '';
  currentUserTrainingStatus = '';
  currentTrainingSelected = '';
  listOfTrainingTitles = [];
  legendObj = {};
  tidUTHash: TidUTHash;
  uidTidUTHash: UidTidUTHash = {};
  currentHoverUser: UserModel;
  collapsedNodes: string[] = [];
  uidDataErrorHash = {};
  duplicateEmailHash = {};
  duplicateEmails: string[] = [];
  orgEmails: string[] = [];
  currentDuplicateEmail;
  currentDuplicateEmailUserId;
  emailColor = 'red';
  currentEmailStatus = 'bad';
  teamOrOrg = '';
  nameCnt = 0;
  nodeStatHash = {};
  currentStep = 0;
  showCSV = false;
  manageCurrentTrainingsModal = false;
  trainingStatusChange$: Observable<string>;
  showLegend;
  showMessageModal = false;
  msgSubject = '';
  msgBody = '';
  currentRecipientUid = '';
  tmpUid;
  recipientUidList = [];
  sentList = [];
  percentSent = 0;
  stepParamHash = {};
  taskHash: TaskHash;
  taskStepContentHash: TaskStepContentHash;
  taskHash$: Observable<TaskHash>;
  taskStepContentHash$: Observable<TaskStepContentHash>;
  showUserSearch = false;
  myPlan = null;
  org$: Observable<OrgModel>;
  orgObj: OrgModel;
  //  showUpgradeToExpertDialog = false;
  //  showUpgradeToProDialog = false;
  //  upgradeToExpertOkText = '';
  //  upgradeToProOkText = '';
  @ViewChild('orgChart') orgChart: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadPNGLink') downloadPNGLink: ElementRef;
  showOrgChartImageModal = false;
  orgChartTitle = '';
  today: string;
  showCSVBuffer = false;
  errorUIDs = [];
  showBulkAddModal = false;
  userDataProp1 = '';
  userDataProp2 = '';
  userDataProp3 = '';
  userDataProp4 = '';
  userDataProp5 = '';

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private mailService: MessageService,
    private trainingService: TrainingService,
    private orgService: OrgService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private joyrideService: JoyrideService,
    private taskWizardService: TaskWizardService,
    private notifyService: NotificationService,
    private messageService: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private myLoader: LoaderService,
    private renderer: Renderer2
  ) {
    super();
    this.trainingStatusChange$ = this.userService.getTrainingStatusChangeStream();
    this.maxLevel$ = this.userService.getMaxLevelStream();
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
    this.taskHash$ = this.taskWizardService.getTaskHashStream();
    this.taskStepContentHash$ = this.taskWizardService.getTaskStepContentHashStream();
    this.org$ = this.orgService.getOrgStream();


    //    this.userTrainingService.selectUser(null);
  }

  // ElementRef { nativeElement: <input> }    console.log(this.justCollapsedNode);
  ngAfterViewInit() {

  }

  ngOnInit() {


    this.today = String(new Date().getTime());
    this.orgChartTitle = 'User Status';

    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      let uid = params.get('uid');
      if (uid) {
        this.selectionMode = 'Individual';
        console.log('route', uid);
        setTimeout(() => {
          this.selectUser(uid, -1);
        }, 2000);
      }
    });


    this.taskHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskHash => {
      if (!taskHash) {
        return;
      }

      this.taskHash = taskHash;
    });
    this.org$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgObj => {
      if (!orgObj) {
        return;
      }

      this.orgObj = orgObj;
      this.myPlan = orgObj.plan;
      if (this.myPlan === 'basic') {
        this.collapsedNodes = [];
      }
    });

    this.taskStepContentHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskStepContentHash => {
      if (!taskStepContentHash) {
        return;
      }

      this.taskStepContentHash = taskStepContentHash;
      console.log("taskStepContentHash", this.taskStepContentHash);
    });


    this.orgJobTitles = [
      'lifeguard',
      'front desk',
      'programmer',
      'admin',
      'coordinator',
      'project manager'
    ];

    this.userTypes = ['individualContributor', 'individualContributor', 'individualContributor', 'individualContributor', 'individualContributor', 'individualContributor', 'volunteer', 'volunteer', 'volunteer', 'contractor', 'contractor', 'contractor', 'customer', 'customer']

    this.currentHoverUid = null;


    this.userList = [];
    /*
    this.tourStepsHash['myTeam'] = ['Step1-myTeam', 'Step2-myTeam', 'Step3-myTeam', 'Step4-myTeam', 'Step5-myTeam'];
    this.tourStepsHash['memberDetails'] = ['Step1-memberDetails'];
    this.tourStepsHash['orgChart'] = ['Step1-orgChart'];
    */

    this.contentHeight = Math.floor((window.innerHeight - (.3 * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    FlatfileImporter.setVersion(2);
    this.initializeImporter();
    this.maxLevel$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(maxLevel => {
      this.maxLevel = maxLevel;
    });
    /*
    this.batchFails$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(failList => {
      if (!failList) {
        return;
      }
  
      this.batchFails = failList;
    });
    */
    /*
        this.buildOrgProgress$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgProgress => {
          if (!orgProgress) {
            return;
          }
          this.bulkAdd = true;
          //      console.log('Org Progress', orgProgress);
          this.orgProgress = orgProgress;
          if (orgProgress.usersProcessed === orgProgress.usersTotal && orgProgress.supervisorMatchFail.length > 0) {
            this.supervisorMatchFails = orgProgress.supervisorMatchFail;
          }
        });
        */

    this.myOrgUserHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgUserHash => {
      if (!orgUserHash) {
        return;
      }

      this.userList = [];
      this.userListDisplay = [];


      this.myOrgUserHash = orgUserHash;
      this.myOrgUserObjs = Object.values(this.myOrgUserHash);
      console.log('myOrgUserHash$ ', this.myOrgUserObjs);
      this.userList = this.myOrgUserObjs;
      this.userListDisplay = cloneDeep(this.userList);
      this.myOrgSupervisors = [];
      let bulkAddFailFound = false;
      let listOfSupervisorIds = [];

      for (let user of this.myOrgUserObjs) {
        if (!user.supervisorId) {
          continue;
        }

        if (user.settings.statusList.includes('duplicateEmail')) {
          this.duplicateEmailHash[user._id] = user.email;
          this.duplicateEmails.push(user.email);
        } else {
          this.orgEmails.push(user.email);
        }
        if (this.duplicateEmails.length > 0) {
          this.currentDuplicateEmail = this.duplicateEmails[0];
          this.currentDuplicateEmailUserId = user._id;
        }

        this.uidDataErrorHash[user._id] = user.settings.statusList
        this.myOrgUserNameHash[user.firstName + ' ' + user.lastName] = user;
        if (listOfSupervisorIds.indexOf(user.supervisorId) < 0) {
          //          this.listOfSupervisors.push({ text: this.myOrgUserHash[user.supervisorId]?.firstName + ' ' + this.myOrgUserHash[user.supervisorId]?.lastName, value: user.supervisorId });
          listOfSupervisorIds.push(user.supervisorId);
        }
        //        this.supervisorIdNameHash[user.supervisorId]
        /*
        if (user.userStatus === 'duplicate-email') {
          bulkAddFailFound = true;
          this.bulkAddFail = true;
        }
        */
        if (user.userType === 'supervisor') {
          this.myOrgSupervisors.push(user.firstName + ' ' + user.lastName);
        }
      }
      this.matchingSupervisors = this.myOrgSupervisors;
      if (this.myPlan && this.myPlan !== 'basic') {
        this.collapseAllSubOrgs(true);
      }
      this.createCSV();
    });
    this.myOrgUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myOrgUsers => {
      if (!myOrgUsers) {
        return;
      }
      this.myOrgUsers = myOrgUsers;
      this.matchingUsers = this.myOrgUsers;
    });
    this.trainingStatusChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uid => {
      if (!uid) {
        return;
      }
      if (this.authenticatedUser) {
        this.figureOrgStat(this.authenticatedUser._id);
        for (let node of this.collapsedNodes) {
          this.figureOrgStat(node);
        }
      }
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
      this.uidUTHash = cloneDeep(uidUTHash);
      let uids = Object.keys(uidUTHash);
      let utList: UserTrainingModel[];
      let tidUTHash: TidUTHash = {};
      for (let uid of uids) {
        utList = this.uidUTHash[uid];
        if (!utList) {
          continue;
        } else {
          for (let ut of utList) {
            tidUTHash[ut.tid] = cloneDeep(ut);
          }
          this.uidTidUTHash[uid] = cloneDeep(tidUTHash);
        }
      }
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
      for (let node of this.nodes) {
        this.orgChartNodeHash[node.extra.uid] = node;
      }

    });
    this.myTeam$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userList => {
      //      console.log('myTeam$  ', userList);
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
        this.selectedUser = null;
        return;
      }
      this.userIdSelected = user._id;

      this.selectedUser = user;
      if ((user.supervisorId && this.myOrgUserHash[user.supervisorId]) && (this.authenticatedUser && user._id !== this.authenticatedUser._id)) {
        //      if ((user.supervisorId && this.myOrgUserHash[user.supervisorId])) {
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
      if (this.currentSelectedReportChain) {
        for (let uid of this.currentSelectedReportChain) {
          this.collapsedNodes.splice(this.collapsedNodes.indexOf(uid), 1);
        }
      }
      this.centerIt(this.selectedUser);
      this.setHoverData(this.selectedUser._id);
    });

    this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      if (!userTrainings) {
        return;
      }
      if (userTrainings.length > 0 && this.myOrgUserHash[userTrainings[0].uid].trainingStatus === 'none') {
        this.myOrgUserHash[userTrainings[0].uid].trainingStatus = 'upToDate';
        this.userService.updateUser(this.myOrgUserHash[userTrainings[0].uid], false);
      }
      if (this.selectionMode === 'Individual') {
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
            /*
            if (training.versions.length < 2) {
              continue;
            }
            */
            this.assignableTrainings.push(training);
          }
        }
      }

    });

    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }

      this.figureOrgStat(user._id);

      this.authenticatedUser = user;

      this.showLegend = this.authenticatedUser.settings.showLegend;

      this.myOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
      this.orgEmails.push(this.authenticatedUser.email);
      this.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
      this.teamId = this.authenticatedUser._id;
      this.authenticatedUserFullName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
      this.importer.setCustomer({
        userId: this.authenticatedUser._id,
        name: this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName
      });

      this.myOrgUserNameHash[this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName] = this.authenticatedUser;

      this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.uid = params.get('uid');
        if (!this.uid) {
          this.uid = this.authenticatedUser._id;
        }
        //        this.userService.selectUser(this.uid);
      });
      //      this.selectUser(this.authenticatedUser._id);
      this.assignableTrainings = [];

      this.allTrainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(allTrainingIdHash => {
        this.allTrainingIdHash = allTrainingIdHash;

        let trainings = Object.values(this.allTrainingIdHash);
        this.teamTrainings = [];
        this.listOfTrainingTitles = [];
        for (let training of trainings) {
          this.listOfTrainingTitles.push({ text: training.versions[0].title, value: training._id });
          //          this.iconClassToColorHash[training.iconClass] = training.iconColor;
          this.teamTrainings.push(training);
          //          this.showTrainingHash[training._id] = training;
        }
      });
    })

    this.jobTitles$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobTitles => {
      this.listOfJobTitles = [];
      this.jobTitles = jobTitles;
      for (let jobTitle of this.jobTitles) {
        this.listOfJobTitles.push({ text: jobTitle, value: jobTitle });
      }
      this.matchingJobTitles = this.jobTitles;
    })

    this.userFail$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userFail => {

    })
  }
  /*
    startTour(task) {
      let steps = this.taskWizardHash[task];
      this.joyrideService.startTour({ steps: steps, stepDefaultPosition: 'bottom', themeColor: '#0d1cb9' });
    }
  
    task2Step2() {
      this.collapsedNodes.splice(this.collapsedNodes.indexOf(this.authenticatedUser._id), 1);
      for (let dr of this.authenticatedUser.directReports) {
        if (this.myOrgUserHash[dr].userType === 'supervisor') {
          this.taskItemHash['task2Step3'] = dr;
          this.selectUser(dr, -1);
          break;
        }
      }
    }
    */

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    this.currentStep += 1;
  }

  done(): void {
    this.showBulkAddModal = false;
//      this.userService.createNewUsersFromBatch(this.newUsers, false);
  }

  downloadPNGImage() {
    this.downloadPNGLink.nativeElement.click();
    setTimeout(() => {
      this.showOrgChartImageModal = false;
    }, 3000);
  }

  showDownloadPNGImageModal() {
    if (this.orgObj.plan === 'basic') {
      this.orgService.showUpgradeToProDialog(true);
    } else {
      this.canvas.nativeElement.src = '';
      // The org chart looks better without the selected-node class
      let tmpUserIdsSelected = Object.assign([], this.userIdsSelected);
      this.userIdsSelected = [];
      this.showOrgChartImageModal = true;
      setTimeout(() => {
        html2canvas(this.orgChart.nativeElement).then(canvas => {
          this.canvas.nativeElement.src = canvas.toDataURL();
          this.downloadPNGLink.nativeElement.href = canvas.toDataURL('image/png');
          this.downloadPNGLink.nativeElement.download = 'orgChart.png';
          this.userIdsSelected = tmpUserIdsSelected;
        })
      }, 1000);
    }
  }

  onTaskWizardNext(taskStep) {
    switch (taskStep) {
      case 'task1Step1': {
        this.selectionMode = 'Individual';
        break;
      }
      case 'task1Step2': {
        this.userIdSelected = this.authenticatedUser._id;
        break;
      }
      case 'task1Step3': {
        this.showUserTrainingModal = true;
        break;
      }
    }
  }

  collapseAllSubOrgs(collapseAll) {
    //    this.myLoader.setLoading(true, 'https://localhost:4200/myteam');
    if (collapseAll) {

      this.collapsedNodes = [];
      for (let user of this.userListDisplay) {
        if (user.userType === 'supervisor') {
          this.collapsedNodes.push(user._id);
          this.figureOrgStat(user._id);
        }
      }
    } else {
      this.collapsedNodes = [];
    }
    //    this.myLoader.setLoading(false, 'https://localhost:4200/myteam');
  }

  collapseNode(uid: string, collapse: boolean) {
    if (this.orgObj.plan === 'basic') {
      this.orgService.showUpgradeToProDialog(true);
      //      this.showUpgradeToProDialog = true;
    } else {
      if (collapse) {
        this.collapsedNodes.push(uid);
        this.figureOrgStat(uid);
      } else {
        this.collapsedNodes.splice(this.collapsedNodes.indexOf(uid), 1);
      }
      setTimeout(() => this.centerIt(uid), 500);
    }
  }

  centerIt(id) {
    let element: Element;
    element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
    }
  }

  handleSendMessageCancel() {
    this.showMessageModal = false;
  }

  /*
  timeOf = (interval: number) => <T>(val: T) =>
    timer(interval).pipe(map(x => val));
  
  timed = (interval: number) => <T>(source: Observable<T>) =>
    source.pipe(
      concatMap(this.timeOf(1000)),
      map(x => [x]),
      scan((acc, val) => [...acc, ...val]),
    )
  
  arr$ = from(this.arr)
    .pipe(
      timed(1000),
    )
    */
  //  delayAndCall(arr:)

  sendMessage() {
    let toList = [];
    let dynamicTemplateData = {};
    let msg = <MessageModel>{
      _id: null,
      uid: null,
      state: 'draft',
      category: 'userMessage',
      sentDate: new Date().getTime(),
      to: null,
      from: this.authenticatedUser.email,
      subject: this.msgSubject,
      text: this.msgBody
    }
    for (let uid of this.recipientUidList) {
      toList.push(this.myOrgUserHash[uid].email);
      dynamicTemplateData[this.myOrgUserHash[uid].email] = {
        uid: uid
      }
    }
    this.showMessageModal = false;
    this.mailService.sendMessages(msg, toList, null, this.test);
  }

  currentRecipient(uid) {
    this.currentRecipientUid = uid;
  }

  removeRecipient(index) {
    this.recipientUidList.splice(index, 1);
  }


  showAssignTrainingModal() {
    if (this.orgObj.plan === 'basic' || this.orgObj.plan === 'pro') {
      //      this.showUpgradeToExpertDialog = true;
      this.orgService.showUpgradeToExpertDialog(true);
    } else {
      this.showUserTrainingModal = true;
    }
  }

  showMsgModal() {
    console.log('showMsgModal', this.orgObj);
    if (this.orgObj.plan === 'basic' || this.orgObj.plan === 'pro') {
      //      this.showUpgradeToExpertDialog = true;
      this.orgService.showUpgradeToExpertDialog(true);
    } else {
      this.showMessageModal = true;
      this.recipientUidList = Object.assign(this.recipientUidList, this.userIdsSelected);
    }
  }

  getSelectedTrainingIconClass(tid: string): string {
    //    console.log('getSelectedTrainingIconClass', tid);
    if (!this.allTrainingIdHash[tid]) {
      return 'fas fa-graduation-cap';
    }
    return this.allTrainingIdHash[tid].versions[0].iconClass;
  }

  getTrainingIconColor(tid: string): string {
    //    console.log('getTrainingIconColor', tid);
    if (!this.allTrainingIdHash[tid]) {
      return 'orange';
    }
    return this.allTrainingIdHash[tid].versions[0].iconColor;
  }

  resendRegistrationMsg(to: string, from: string) {
    this.userService.sendRegistrationMsg(to, from);
    let msg = 'Registration messasge resent.';
    this.createBasicMessage(msg);
  }

  closeUserDetails() {
    this.userDetailIsVisible = false;
  }

  openUserDetails() {
    this.userDetailIsVisible = true;
  }

  createBasicMessage(msg: string) {
    this.messageService.info(msg);
  }

  createCSV() {
    this.usersCSV = '';
    let supervisorName: string;
    if (this.myOrgUserObjs) {
      for (let user of this.myOrgUserObjs) {
        //        if (user.supervisorId) {
        //          supervisorName = this.myOrgUserHash[user.supervisorId].firstName + ' ' + this.myOrgUserHash[user.supervisorId].lastName;
        //        } else {
        //          supervisorName = '';
        //        }
        this.usersCSV += user.firstName + ',' + user.lastName + ',' + user.email + ',' + user.supervisorId + ',' + user.jobTitle + ',' + user.userType + ',' + 'geo=' + this.getGeo() + '\n';
      }
    }
  }

  getGeo(): string {
    let geo: string;
    return geo;
  }

  jobTitleSelectedChanged(filters: string[]) {
    this.userIdsSelected = [];
    this.currentJobTitlesSelected = [];
    this.currentJobTitlesSelected = Object.assign(this.currentJobTitlesSelected, filters);
    for (let user of this.myOrgUserObjs) {
      if (this.currentJobTitlesSelected.includes(user.jobTitle)) {
        this.userIdsSelected.push(user._id);
      }
    }
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
  }

  trainingSelectedChanged(training: string) {
    this.userIdsSelected = [];
    this.uidTidUTHash = {};
    this.currentTrainingSelected = training;
    this.orgChartTitle = this.allTrainingIdHash[training].title;
    for (let user of this.myOrgUserObjs) {
      let tidUTHash = {};
      let tids = [];
      let utList = this.uidUTHash[user._id];

      if (utList) {
        for (let ut of utList) {
          tidUTHash[ut.tid] = cloneDeep(ut);
          tids.push(ut.tid);
        }
        this.uidTidUTHash[user._id] = Object.assign({}, tidUTHash);
        if (tids.includes(training)) {
          this.userIdsSelected.push(user._id);
        }
      }
    }
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }

  }

  zoomIn() {
    this.iconFontSize += 1;
    this.textFontSize += 1;
  }

  zoomOut() {
    if (this.iconFontSize > 2) {
      this.iconFontSize -= 1;
    }
    if (this.textFontSize > 2) {
      this.textFontSize -= 1;
    }
  }
  resetFilters(): void {
    this.listOfJobTitles = [];
    for (let jobTitle of this.jobTitles) {
      this.listOfJobTitles.push({ text: jobTitle, value: jobTitle });
    }

    this.listOfTrainingStatus = [{ text: 'No Trainings', value: 'none' }, { text: 'Past Due', value: 'pastDue' }, { text: 'In Progress', value: 'upToDate' }];
    this.listOfUserTypes = [{ text: 'Individual Contributor', value: 'individualContributor' }, { text: 'Supervisor', value: 'supervisor' }, { text: 'Volunteer', value: 'volunteer' }, { text: 'Customer', value: 'customer ' }, { text: 'Contractor', value: 'contractor' }];
    this.listOfSearchTrainingStatus = [];
    this.listOfSearchUserTypes = [];
    this.listOfSearchJobTitles = [];
    this.listOfSearchUserData1 = [];
    this.search();
  }

  filterJobTitles(listOfSearchJobTitles: string[]): void {
    this.listOfSearchJobTitles = listOfSearchJobTitles;
    //    console.log('filterJobTitles', this.listOfSearchJobTitles);
    this.search();
  }

  filterUserData1(listOfSearchUserData1: string[]): void {
    this.listOfSearchUserData1 = listOfSearchUserData1;
    //    console.log('filterJobTitles', this.listOfSearchJobTitles);
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

  statusChanged(status) {

  }

  search(): void {
    const filterFunc = (item: UserModel) =>
      (this.listOfSearchTrainingStatus.length ? this.listOfSearchTrainingStatus.some(trainingStatus => item.trainingStatus === trainingStatus) : true) &&
      (this.listOfSearchUserTypes.length ? this.listOfSearchUserTypes.some(userType => item.userType === userType) : true) &&
      (this.listOfSearchJobTitles.length ? this.listOfSearchJobTitles.some(jobTitle => item.jobTitle === jobTitle) : true)
    const data = this.userList.filter(item => filterFunc(item));

    this.userListDisplay = [];
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
    //    this.selectUser(this.userIdSelected, this.userListDisplay.indexOf(this.selectedUser, 0));
    this.userService.selectUser(this.userIdSelected);
    this.rowSelected = this.userListDisplay.indexOf(this.selectedUser, 0);
  }

  toggleMainView(showOrg) {
    if (showOrg === 'false') {
      this.isOrgView = false;
      this.rowSelected = this.userListDisplay.indexOf(this.selectedUser, 0);
      this.resetFilters();
      this.selectionMode = 'Individual';
    } else {
      this.isOrgView = true;
    }
  }
  /*
    toggleOrientation(vertical) {
      if (vertical === 'true') {
        this.isVertical = true;
      } else {
        this.isVertical = false;
      }
    }
    */

  deleteAllUsers() {

  }

  testBulkAdd() {
    let currentSupervisorEmail = this.authenticatedUser.email;
    let supervisorCnt = 1;
    let name: string = this.getTestUser();
    let fullName: string[] = name.trim().split(' ');
    let level = 1;
    let jobTitleIndex = 0;
    let node = <UserBatchData>{
      firstName: this.authenticatedUser.firstName,
      lastName: this.authenticatedUser.lastName,
      email: 'gregl@teknetium.com',
      userType: 'supervisor',
      jobTitle: 'Manager',
      supervisorEmail: null
    }

    let teamSize = Math.floor(this.randn_bm(this.userMin, this.userMax, 2));
    for (let i = 0; i < teamSize; i++) {
      let childNode = this.buildNode(currentSupervisorEmail, level);
      this.testNodes.push(childNode);
    }

    //    this.testNodes.push(node);
    this.newUsers = this.testNodes;

    this.userService.createNewUsersFromBatch(this.newUsers, true);
  }


  buildNode(supervisorEmail: string, level: number): UserBatchData {
    let name: string;
    let teamSize: number;
    name = this.getTestUser();
    let fullName: string[] = name.trim().split(' ');
//    let empId: string = String(new Date().getTime()) + String(this.nameCnt++).trim();

    let node = <UserBatchData>{
      firstName: fullName[0],
      lastName: fullName[1],
      email: fullName[0] + '.' + fullName[1] + '@' + this.authenticatedUser.org + '.com',
      userType: 'individualContributor',
      jobTitle: 'coordinator',
      supervisorEmail: supervisorEmail
    }

    if (level < this.maxLevel) {
      if (Math.random() < .7) {
        node.userType = 'supervisor';
        node.jobTitle = 'Manager';
        if (level < this.maxLevel - 1) {
          teamSize = Math.floor(this.randn_bm(this.userMin, this.userMax, 2));
        } else if (level === this.maxLevel - 1) {
          teamSize = Math.floor(this.randn_bm(this.maxLevelUserMin, this.maxLevelUserMax, 2));
        }
        level++;
        if (teamSize === 0) {
          node.userType = 'individualContributor';
        }
        for (let i = 0; i < teamSize; i++) {
          //          let childNode = this.buildNode(fullName[0] + ' ' + fullName[1], fullName[0] + '.' + fullName[1] + '@gmail.com', level);
          let childNode = this.buildNode(node.email, level);
          this.testNodes.push(childNode);
        }
      }
    } else {
      let jobTitleIndex = Math.floor(Math.random() * Math.floor(this.orgJobTitles.length - 1));
      let userTypeIndex = Math.floor(Math.random() * Math.floor(this.userTypes.length - 1));
      node.jobTitle = this.orgJobTitles[jobTitleIndex];
      node.userType = this.userTypes[userTypeIndex];
    }
    return node;
  }

  getTestUser(): string {
    let nameListSize = this.nameList.length;
    let index = Math.floor(Math.random() * Math.floor(nameListSize));
    return this.nameList[index].trim() + String(this.nameCnt++).trim();
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
      this.currentHoverUid = null;
      this.currentHoverUser = null;
      this.currentHoverReportChain = [];
      return;
    }
    if (!this.nodeStatHash[uid]) {
      this.figureOrgStat(uid);
    }
    this.currentHoverUid = uid;
    this.currentHoverUser = this.myOrgUserHash[uid];
    if (this.orgChartNodeHash[uid]) {
      this.currentHoverReportChain = this.orgChartNodeHash[uid].extra.reportChain;
    }
  }

  checkUniqueEmail(data) {
    if (!this.selectedUser.email || this.selectedUser.email === '') {
      this.emailUnique = false;
      return;
    }
    //    console.log('checkUniqueEmail', data);
    this.userService.getUserByEmail$(this.selectedUser.email).subscribe(user => {
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

  async launchImporter() {
    try {

      let results = await this.importer.requestDataFromUser();
      this.importer.displayLoader();
      this.importer.displaySuccess("Success!");
      this.results = JSON.stringify(results.validData, null, 2);

      this.newUsers = JSON.parse(this.results);
      if (this.showBulkAddModal) {
        this.next();
      }
//      this.userService.createNewUsersFromBatch(this.newUsers, false);
      //        this.trainingService.assignTrainingsForJobTitle(this.newTeamMember.jobTitle, this.newTeamMember._id, this.newTeamMember.teamId);
      //        this.newUsers = [{ firstName: '', lastName: '', email: '', jobTitle: '', supervisorName: '' }];
    } catch (e) {
      console.info(e || "window close");
    }
  }

  registerUsers() {
    this.userService.createNewUsersFromBatch(this.newUsers, false);
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
          label: "Supervisor's Email Address",
          key: "supervisorEmail",
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
          label: "User Data 1",
          key: "userData1",
          validators: []
        },
        {
          label: "User Data 2",
          key: "userData2",
          validators: []
        },
        {
          label: "User Data 3",
          key: "userData3",
          validators: []
        },
        {
          label: "User Data 4",
          key: "userData4",
          validators: []
        },
        {
          label: "User Data 5",
          key: "userData5",
          validators: []
        },

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
    let userNameList: string[] = [];
    for (let user of this.userListDisplay) {
      userNameList.push(user.firstName + ' ' + user.lastName);
    }
    this.matchingUsers = userNameList.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    let index = userNameList.indexOf(value);
    if (index > -1) {
      this.setSelectionMode('Individual');
      //      this.selectionMode = 'Individual';
      //      this.userIdsSelected = [];
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
    this.newTeamMember.userData = {};
    this.newTeamMember.settings = {
      statusList: [],
      showCSV: false,
      themeColor: {
        name: 'grey',
        primary: 'white',
        secondary: '#999999',
        bgColor: '#e9e9e9',
      },
      showLegend: true,
      showInactiveUsers: true,
      showAlerts: true,
      showTasks: true
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

  userTypeSelectedChanged(userType: string) {
    this.currentUserType = userType;
    this.userIdsSelected = [];
    for (let user of this.myOrgUserObjs) {
      if (this.currentUserType === user.userType) {
        this.userIdsSelected.push(user._id);
      }
    }
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
  }

  userStatusSelectedChanged(userStatus: string) {
    this.currentUserStatus = userStatus;
    this.userIdsSelected = [];
    this.errorUIDs = [];
    for (let user of this.myOrgUserObjs) {
      if (this.currentUserStatus === user.userStatus) {
        if (user.userStatus === 'error') {
          this.errorUIDs.push(user._id);
        } else {
          this.userIdsSelected.push(user._id);
        }
      }
    }
    if (this.errorUIDs.length > 0) {
      this.selectUser(this.errorUIDs[0], 0);
    }
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
  }

  userTrainingsStatusSelectedChanged(userTrainingStatus: string) {
    this.currentUserTrainingStatus = userTrainingStatus;
    this.userIdsSelected = [];
    for (let user of this.myOrgUserObjs) {
      if (this.currentUserTrainingStatus === user.trainingStatus) {
        this.userIdsSelected.push(user._id);
      }
    }
  }

  userDataErrorSelectedChanged(userDataError: string) {
    this.currentUserDataError = userDataError;
    this.userIdsSelected = [];
    for (let user of this.myOrgUserObjs) {

      if (user.settings.statusList && user.settings.statusList.includes(userDataError)) {
        this.userIdsSelected.push(user._id);
      }
    }
  }

  emailIsValid(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email)
  }

  setOnboardScope(value: string) {
    this.teamOrOrg = value;
  }

  duplicateEmailChange(email: string) {
    this.currentDuplicateEmail = email;
    if (this.emailIsValid(email)) {
      if (!this.orgEmails.includes(email)) {
        this.emailColor = 'green';
        this.currentEmailStatus = 'good';
      } else {
        this.emailColor = 'red';
        this.currentEmailStatus = 'bad';
      }
    }
  }

  saveCorrectedEmail() {
    let user = this.myOrgUserHash[this.currentDuplicateEmailUserId];
    if (this.currentEmailStatus === 'good') {
      user.email = this.currentDuplicateEmail;
      this.duplicateEmails.shift();
      this.currentDuplicateEmail = this.duplicateEmails[0];
      //      this.userIdsSelected.splice(this.userIdsSelected.indexOf())
      this.userService.updateUser(user, false);
    }
  }

  setSelectionMode(mode: string) {
    this.currentJobTitlesSelected = [];
    this.userIdsSelected = [];
    this.currentUserType = 'none';
    this.currentUserStatus = 'none';
    this.assignableTrainings = cloneDeep(this.teamTrainings);

    this.currentTrainingSelected = null;
    /*
    if ((this.myPlan === 'pro' || this.myPlan === 'basic') && (mode === 'UserType' || mode === 'JobTitle' || mode === 'Org')) {
      this.showUpgradeDialog = true;
    }
    */
    this.selectionMode = mode;
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
    switch (mode) {
      case 'JobTitle': {
        this.orgChartTitle = 'Job Titles';
        break;
      }
      case 'Training': {
        this.orgChartTitle = '';
        break;
      }
      case 'UserStatus': {
        this.orgChartTitle = 'User Status';
        break;
      }
      case 'UserType': {
        this.orgChartTitle = 'User Type';
        break;
      }
      case 'Individual': {
        this.orgChartTitle = 'User Training Status';
        break;
      }
      case 'Org': {
        this.orgChartTitle = 'User Training Status';
        break;
      }
    }

  }

  selectUser(userId: string, i: number) {
    if (this.selectionMode === 'Individual') {
      if (this.userIdSelected === userId) {
        this.userService.selectUser(null);
        this.userDetailIsVisible = false;
        this.rowSelected = -1;
      } else {
        this.userService.selectUser(userId);
        this.rowSelected = i;
        this.userDetailIsVisible = true;
      }
      this.figureOrgStat(this.authenticatedUser._id);
      for (let node of this.collapsedNodes) {
        this.figureOrgStat(node);
      }
    } else if (this.selectionMode === 'Org') {
      if (this.userIdsSelected.includes(userId)) {
        this.removeFromSelectedList(userId);
      } else {
        this.buildSelectedList(userId);
      }
    }
  }

  removeFromSelectedList(userId: string) {
    this.userIdsSelected.splice(this.userIdsSelected.indexOf(userId), 1);
    this.removeDirectReportsFromSelectedList(this.myOrgUserHash[userId]);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
  }

  buildSelectedList(userId: string) {
    this.userIdsSelected.push(userId);
    this.addDirectReportsToSelectedList(this.myOrgUserHash[userId])
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
  }

  figureOrgStat(userId: string) {
    let nodeStatObj = <NodeStat>{
      rootUid: userId,
      userCnt: 0,
      selectedCnt: 0,
      noneCnt: 0,
      pastDueCnt: 0,
      upToDateCnt: 0,
      trainingHash: {
        none: 0,
        upToDate: 0,
        pastDue: 0,
        completed: 0,
        pendingCertUpload: 0
      },
      userTypeHash: {
        individualContributor: 0,
        supervisor: 0,
        volunteer: 0,
        contractor: 0,
        customer: 0
      },
      userStatusHash: {
        active: 0,
        inactive: 0,
        pending: 0,
        error: 0
      },
      jobTitleHash: {},
      userData1Hash: {},
      userData2Hash: {},
      userData3Hash: {},
      userData4Hash: {},
      userData5Hash: {},
    }

    this.nodeStatHash[userId] = cloneDeep(nodeStatObj);
    let nodeStat = this.nodeStatHash[userId];
    for (let jobTitle of this.jobTitles) {
      nodeStat.jobTitleHash[jobTitle] = 0;
    }
    this.processDirectReports(this.myOrgUserHash[userId], this.nodeStatHash[userId])
  }

  processDirectReports(user: UserModel, nodeStat: NodeStat) {
    if (!user) {
      return;
    }
    for (let dr of user.directReports) {
      nodeStat.userCnt++;
      let drUser = this.myOrgUserHash[dr];
      if (drUser.trainingStatus === 'pastDue') {
        nodeStat.pastDueCnt++;
      } else if (drUser.trainingStatus === 'none') {
        nodeStat.noneCnt++;
      } else if (drUser.trainingStatus === 'upToDate') {
        nodeStat.upToDateCnt++;
      }

      nodeStat.jobTitleHash[drUser.jobTitle] += 1;

      //      console.log('processDirectReports', nodeStat);

      if (this.selectionMode === 'Individual') {
        if (this.userIdSelected === dr) {
          nodeStat.selectedCnt++;
        }
      }

      if (this.selectionMode === 'Org') {
        if (this.userIdsSelected.includes(dr)) {
          nodeStat.selectedCnt++;
        }
      }

      switch (drUser.userType) {
        case 'individualContributor':
          nodeStat.userTypeHash['individualContributor'] += 1;
          break;
        case 'supervisor':
          nodeStat.userTypeHash['supervisor'] += 1;
          break;
        case 'volunteer':
          nodeStat.userTypeHash['volunteer'] += 1;
          break;
        case 'contractor':
          nodeStat.userTypeHash['contractor'] += 1;
          break;
        case 'customer':
          nodeStat.userTypeHash['customer'] += 1;
          break;
        default:
          break;
      }
      switch (drUser.userStatus) {
        case 'active':
          nodeStat.userStatusHash['active'] += 1;
          break;
        case 'inactive':
          nodeStat.userStatusHash['inactive'] += 1;
          break;
        case 'pending':
          nodeStat.userStatusHash['pending'] += 1;
          break;
        case 'error':
          nodeStat.userStatusHash['error'] += 1;
          break;
        default:
          break;
      }

      if (this.currentJobTitlesSelected.length > 0) {
        if (this.currentJobTitlesSelected.includes(drUser.jobTitle)) {
          nodeStat.selectedCnt++;
        }
      }
      if (this.currentUserType !== 'none') {
        if (this.currentUserType === drUser.userType) {
          nodeStat.selectedCnt++;
        }
      }

      if (this.currentUserStatus !== 'none') {
        if (this.currentUserStatus === drUser.userStatus) {
          nodeStat.selectedCnt++;
        }
      }

      if (this.currentTrainingSelected) {
        let utList = this.uidUTHash[dr];
        if (utList && utList.length > 0) {
          for (let ut of utList) {
            if (ut.tid === this.currentTrainingSelected) {
              nodeStat.selectedCnt++;
              switch (ut.status) {
                case 'upToDate':
                  nodeStat.trainingHash['upToDate'] += 1;
                  break;
                case 'pastDue':
                  nodeStat.trainingHash['pastDue'] += 1;
                  break;
                case 'completed':
                  nodeStat.trainingHash['completed'] += 1;
                  break;
                case 'pendingCertUpload':
                  nodeStat.trainingHash['pendingCertUpload'] += 1;
                  break;
                default:
                  nodeStat.trainingHash['none'] += 1;
                  break;
              }
            }
          }
        }
      }
      if (drUser.directReports.length > 0) {
        this.processDirectReports(drUser, nodeStat);
      }
    }
  }

  removeDirectReportsFromSelectedList(user: UserModel) {
    if (!user) {
      return;
    }
    for (let userId of user.directReports) {
      let drUser = this.myOrgUserHash[userId];
      this.userIdsSelected.splice(this.userIdsSelected.indexOf(userId), 1);
      if (drUser.directReports.length > 0) {
        this.removeDirectReportsFromSelectedList(drUser);
      }
    }
  }
  addDirectReportsToSelectedList(user: UserModel) {
    if (!user) {
      return;
    }
    for (let userId of user.directReports) {
      if (!this.userIdsSelected.includes(userId)) {
        let drUser = this.myOrgUserHash[userId];
        this.userIdsSelected.push(userId);
        if (drUser.directReports.length > 0) {
          this.addDirectReportsToSelectedList(drUser);
        }
      }
    }
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

  handleOkManageCurrentTrainings() {
    this.manageCurrentTrainingsModal = false;
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

  confirmInactive(user: UserModel) {
    if (user._id === this.authenticatedUser._id) {
      return;
    }
    this.userService.markUserAsInactive(user._id);
    this.userTrainingService.deleteUTForUser(user._id);
    this.userService.selectAuthenticatedUser();
  }

  getStatusColor(uid: string): string {

    let ut: UserTrainingModel;

    if (this.selectionMode === 'Training' && this.userIdsSelected.includes(uid)) {
      let tidUTHash = this.uidTidUTHash[uid];
      if (tidUTHash) {
        ut = tidUTHash[this.currentTrainingSelected];
        return this.userTrainingStatusColorHash[ut.status];
      } else {
        return 'orange';
      }
    } else if (this.selectionMode === 'UserStatus') {
      return this.userStatusColorHash[this.myOrgUserHash[uid].userStatus];
    } else if (this.myOrgUserHash[uid]) {
      return this.userTrainingStatusColorHash[this.myOrgUserHash[uid].trainingStatus];
    }
  }

  confirmUserTrainingDelete() {
    let upToDateUIDs = [];
    let noneUIDs = [];
    for (let uid of this.userIdsSelected) {
      let user = this.myOrgUserHash[uid];
      let utList = this.uidUTHash[uid];
      let newUtList = [];
      let currentUserTrainingStatus: string;
      if (utList.length === 1) {
        user.trainingStatus = 'none';
        this.uidUTHash[uid] = [];
        noneUIDs.push(uid);
      } else {
        let pastDueFound = false;
        for (let ut of utList) {
          if (ut.tid !== this.currentTrainingSelected) {
            newUtList.push(ut);
            if (ut.status === 'pastDue') {
              pastDueFound = true;
            }
          } else {
            if (ut.status === 'pastDue') {
              currentUserTrainingStatus = 'pastDue';
            }
          }
        }
        this.uidUTHash[uid] = newUtList;
        if (!pastDueFound) {
          user.trainingStatus = 'upToDate';
          upToDateUIDs.push(uid);
        }
      }

      //      this.userTrainingService.deleteUserTrainingByTidUid(this.currentTrainingSelected, uid);
    }
    this.userService.setUsersStatusNone(noneUIDs);
    this.userService.setUsersStatusUpToDate(upToDateUIDs);
    this.userTrainingService.bulkDeleteTraining(this.userIdsSelected, this.currentTrainingSelected);
    //    this.userTrainingService.deleteUTForTid(this.currentTrainingSelected);
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
    this.currentTrainingSelected = null;
    this.userIdsSelected = [];
  }

  handleAssignUserTraining() {
    if (!this.selectedTrainingId || this.assignableTrainings.length === 0) {
      this.showUserTrainingModal = false;
      return;
    }
    if (this.selectionMode === 'Individual') {
      let training = this.allTrainingIdHash[this.selectedTrainingId];
      this.userTrainingService.assignTraining(this.selectedUser, training);

      if (this.selectedUser.trainingStatus === 'none') {
        this.selectedUser.trainingStatus = 'upToDate';
        this.userService.updateUser(this.selectedUser, false);
      }
      this.assignableTrainings.splice(this.assignableTrainings.indexOf(this.selectedTrainingId), 1);
      this.userTrainingService.getUTForUser(this.userIdSelected);
    } else {
      let training = this.allTrainingIdHash[this.selectedTrainingId];
      let alert = <AlertModel>{
        type: 'info',
        message: 'The training "' + this.allTrainingIdHash[this.selectedTrainingId].versions[0].title + '" is being assigned to ' + this.userIdsSelected.length + ' users.'
      }
      this.notifyService.showAlert(alert);
      this.userTrainingService.bulkAssignTraining(this.userIdsSelected, training, this.authenticatedUser._id);
      for (let uid of this.userIdsSelected) {
        let user = this.myOrgUserHash[uid];
        if (user.trainingStatus === 'none') {
          user.trainingStatus = 'upToDate';
        }
      }
    }
    this.figureOrgStat(this.authenticatedUser._id);
    for (let node of this.collapsedNodes) {
      this.figureOrgStat(node);
    }
    this.showUserTrainingModal = false;
    this.selectedTrainingId = null;
  }

  onDragStart(event) {
    this.dragging = true;
    this.resizeBarColor = '#7fa9f9';
  }

  selectTraining(tid: string): void {
    if (this.allTrainingIdHash[tid].versions.length === 1) {
      return;
    }
    this.selectedTrainingId = tid;
  }

  closeUserPanel() {
    this.userPanelVisible = false;
  }

  versionFormatter(version) {
    if (!version) {
      return;
    }
    let re = /_/g;
    return version.replace(re, '.');
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

}
