export interface OrgModel {
  _id: string,
  name: string,
  domain: string,
  adminIds: string[],
  createDate: number,
  owner: string,
  userCount: number,
  planId: string,
  planName: string
}
