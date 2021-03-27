export interface OrgModel {
  _id: string,
  domain: string,
  adminIds: string[],
  createDate: number,
  owner: string,
  userCount: number,
  plan: 'earlyAccess' | 'basic' | 'pro' | 'expert' | 'none',
}
