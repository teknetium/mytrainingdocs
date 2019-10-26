export interface UserModel {
  _id: string,
  uid: string,
  userType: 'supervisor' | 'individualContributor' | 'volunteer' | 'customer',
  firstName: string,
  lastName: string,
  email: string,
  org: string,
  userStatus: string,
  trainingStatus: string,
  directReports: Array<string>,
  profilePicUrl: string,
  supervisorId: string,
}

export class UserSessionModel {
  constructor(
    public _id: string,
    public tid: string,
    public startTime: number,
    public endTime: number,
  ) {}
}
