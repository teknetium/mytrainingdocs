import { HttpErrorResponse } from '@angular/common/http';

export interface UserModel {
  _id: string,
  uid: string,
  userType: 'supervisor' | 'individualContributor' | 'volunteer' | 'customer' | 'contractor',
  firstName: string,
  lastName: string,
  email: string,
  emailVerified: boolean,
  org: string,
  teamId: string,
  teamAdmin: boolean,
  appAdmin: boolean,
  orgAdmin: boolean,
  userStatus: 'pending' | 'active' | 'inactive'
  trainingStatus: 'upToDate' | 'pastDue' | 'none',
  jobTitle: string,
  profilePicUrl: string,
  supervisorId: string,
  directReports: string[],
  settings: {
    statusList: string[],
    showCSV: boolean,
    themeColor: {},
    showLegend: boolean,
    showAlerts: boolean
  }
}

export interface UserIdHash {
  [indexer: string]: UserModel;
}

export interface UserBatchData {
  firstName: string,
  lastName: string,
  email: string,
  userType: 'supervisor' | 'individualContributor' | 'volunteer' | 'customer' | 'contractor',
  jobTitle: string,
  supervisorName: string,
  supervisorEmail: string
}


export interface UserFail {
  user: UserModel,
  errorType: string,
  message: string
}

export interface OrgChartNode {
  fName: string;
  lName: string;
  cssClass: string;
  image: string;
  extra: { uid: string, reportChain: string[], peopleCnt: number };
  title: string;
  childs: OrgChartNode[];
  _id?: string;
  level?: number;
  parent?: OrgChartNode;
}

export interface NodeStat {
  rootUid: string,
  userCnt: number,
  selectedCnt: number,
  noneCnt: number,
  upToDateCnt: number,
  pastDueCnt: number,
  trainingHash: Object,
  userTypeHash: Object,
  jobTitleHash: Object
}

export interface BuildOrgProgress {
  usersAdded: number,
  usersProcessed: number,
  usersTotal: number,
  description: string,
  supervisorMatchFail: string[],
}

export class UserSessionModel {
  constructor(
    public _id: string,
    public tid: string,
    public startTime: number,
    public endTime: number,
  ) {}
}
