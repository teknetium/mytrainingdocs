export interface UserTrainingModel {
  _id: string,
  tid: string,
  trainingVersion: string,
  uid: string,
  teamId:string,
  status: 'upToDate' | 'pastDue' | 'completed',
  dueDate: number,
  dateCompleted: number,
  timeToDate: number,
  assessmentResponses: AssessmentResponse[],
  certImage: {
    name: string,
    mimeType: string,
    fileStackId: string,
    fileStackUrl: string,
    dateUploaded: number
  },
}

export interface AssessmentResponse {
  uid: string,
  tid: string,
  assessmentId: string,
  executionDate: number,
  passed: boolean,
  score: number,
  answers: number[],
  isFinal: boolean
}
 
export interface UTSession {
  _id: string,
  utId: string,
  uid: string,
  tid: string,
  teamId: string,
  startTime: number,
  stopTime: number,
}

export interface UTSessionHash {
  [indexer: string]: UTSession;
}

export interface UidUTHash {
  [indexer: string]: UserTrainingModel[];
}

export interface UserTrainingHash {
  [indexer: string]: UserTrainingModel;
}

export interface UidUserTrainingHash {
  [indexer: string]: UserTrainingHash;
}