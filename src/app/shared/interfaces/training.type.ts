export interface TrainingModel {
  _id: string,
  type: string,
  title: string,
  teamId: string,
  owner: string,
  dateCreated: number,
  estimatedTimeToComplete: number,
  description: string,
  image: string,
  iconClass: string,
  iconColor: string,
  iconSource: string,
  introductionLabel: string,
  introduction: string,
  execSummary: string,
  execSummaryLabel: string,
  goals: string,
  goalsLabel: string,
  pages: Page[],
  assessment: Assessment,
  useAssessment: boolean
}

export interface AssessmentItem {
  question: string,
  choices: {
    text: string,
    correct: boolean
  }[]
}
  
export interface Assessment {
  _id: string,
  items: AssessmentItem[]
}

export interface Page {
  _id: string,
  title: string,
  intro: string,
  portlets: Portlet[]
}

export interface Portlet {
  _id: string,
  file: string,
  width: number,
  height: number,
  xLoc: number,
  yLoc: number
}

export interface Comment {
  userId: string,
  commentText: string,
  rating: number
}
