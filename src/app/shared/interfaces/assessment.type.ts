
export interface AssessmentItem {
  question: string,
  choices: string[],
  correctChoice: number
}

export interface Assessment {
  _id: string,
  type: string,
  timeLimit: number,
  passingGrade: number,
  items: AssessmentItem[]
}

