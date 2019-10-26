
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
  sections: Section[],
  assessment: Assessment
  tags: string[]
}

export interface Section {
  title: string,
  intro: string,
  files: string[],
  assessment: Assessment
}

export interface Assessment {
  questions: Question[]
}

export interface Question {
  question: string,
  choices: string[],
  answer: number
}

export interface Comment {
  userId: string,
  commentText: string,
  rating: number
}
