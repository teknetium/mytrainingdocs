export interface OrgModel {
  _id: string,
  domain: string,
  adminId: string,
  createDate: number,
  creatorId: string,
  userCount: number,
  plan: 'Free' | 'Team' | 'Org' | 'Enterprise',
}
