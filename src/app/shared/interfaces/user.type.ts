export interface UserModel {
  _id: string,
  uid: string,
  userType: 'supervisor' | 'individualContributor' | 'volunteer' | 'customer' | 'candidate',
  firstName: string,
  lastName: string,
  email: string,
  org: string,
  teamId: string,
  teamAdmin: boolean,
  appAdmin: boolean,
  orgAdmin: boolean,
  userStatus: 'pending' | 'active' | 'new-supervisor-including-team' | 'new-supervisor-without-team' | 'new-user',
  trainingStatus: 'upToDate' | 'pastDue' | 'none',
  jobTitle: string,
  profilePicUrl: string,
  supervisorId: string,
  directReports: string[],
  settings: object
}

export interface UserIdHash {
  [indexer: string]: UserModel;
} 

export interface OrgChartNode {
  name: string,
  cssClass: string,
  image: string,
  extra: {uid:string, reportChain:string[]}
  title: string,
  childs: OrgChartNode []
}


export class UserSessionModel {
  constructor(
    public _id: string,
    public tid: string,
    public startTime: number,
    public endTime: number,
  ) {}
}
