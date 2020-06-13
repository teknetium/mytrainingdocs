export interface AssessmentItem {
  question: string,
  choices: string[],
  extraInfo: string[],
  correctChoice: number
}

export interface Assessment {
  _id: string,
  type: string,
  title: string,
  owner: string,
  description: string,
  timeLimit: number,
  passingGrade: number,
  isFinal: boolean,
  items: AssessmentItem[]
}

