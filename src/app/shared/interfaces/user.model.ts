export interface UserModel {
  _id: string,
  uid: string,
  userType: 'supervisor' | 'individualContributor' | 'volunteer' | 'customer' | 'candidate',
  firstName: string,
  lastName: string,
  email: string,
  teamId: string,
  adminUp: boolean,
  userStatus: 'pending' | 'active' | 'new-supervisor' | 'new-user',
  trainingStatus: 'uptodate' | 'pastdue',
  jobTitle: string,
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
