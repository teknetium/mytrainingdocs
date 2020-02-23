export interface UserTrainingModel {
  _id: string,
  tid: string,
  trainingVersion: string,
  uid: string,
  status: 'upToDate' | 'pastDue' | 'completed',
  dueDate: number,
  dateCompleted: number,
  timeToDate: number,
  score: number,
  passedAssessment: boolean,
  assessmentResponse: number[]
}

export interface UserTrainingHash {
  [indexer: string]: UserTrainingModel;
}

export interface UidUserTrainingHash {
  [indexer: string]: UserTrainingHash;

}