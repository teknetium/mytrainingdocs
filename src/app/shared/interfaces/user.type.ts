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
    themeColor: {}
  }
}

export interface UserIdHash {
  [indexer: string]: UserModel;
}

export interface UserBatchData {
  firstName: string,
  lastName: string,
  email: string,
  jobTitle: string,
  supervisorName: string
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
