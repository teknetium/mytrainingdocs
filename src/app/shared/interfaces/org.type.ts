export interface OrgModel {
  _id: string,
  domain: string,
  adminIds: string[],
  createDate: number,
  owner: string,
  userCount: number,
  planId: string,
  planName: string
}
