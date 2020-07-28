export interface UserBulkAddModel {
  _id: string
  org: string
  status: 'processed' | 'fail' | 'success'
  firstName: string,
  lastName: string,
  email: string,
  jobTitle: string,
  supervisorName: string,
  supervisorId: string
}
