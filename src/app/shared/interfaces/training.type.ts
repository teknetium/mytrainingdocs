
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
  sections: Section[],
  assessment: Assessment,
  tags: string[]
}

export interface Section {
  _id: string,
  title: string,
  intro: string,
  file: string,
}

export interface Assessment {
  questions: [
    {
      question: string,
      choices: string[],
      answer: number[]
    }
  ]
}

export interface Comment {
  userId: string,
  commentText: string,
  rating: number
}
