export interface UserTrainingModel {
  _id: string,
  tid: string,
  trainingVersion: string,
  uid: string,
  status: 'upToDate' | 'pastDue' | 'completed',
  dueDate: number,
  dateCompleted: number,
  timeToDate: number,
  assessmentResponse: number[]
}