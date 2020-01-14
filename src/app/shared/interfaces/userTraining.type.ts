export interface UserTrainingModel {
  _id: string,
  tid: string,
  uid: string,
  status: 'upToDate' | 'pastDue' | 'completed',
  dueDate: number,
  timeToDate: number
}
