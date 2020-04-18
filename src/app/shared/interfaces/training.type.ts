import { CalendarModule } from "src/app/components/calendar/calendar.module";

export interface TrainingModel {
  _id: string,
  type: 'online' | 'system',
  versions: TrainingVersion[],
  category: string,
  subcategory: string,
  status: 'locked' | 'unlocked' | 'archived',
  title: string,
  teamId: string,
  owner: string,
  dateCreated: number,
  estimatedTimeToComplete: number,
  description: string,
  jobTitle: string,
  image: string,
  introductionLabel: string,
  introduction: string,
  execSummaryLabel: string,
  execSummary: string,
  goalsLabel: string,
  goals: string,
  iconClass: string,
  iconColor: string,
  iconSource: string,
  pages: Page[],
  assessment: Assessment,
  useAssessment: boolean,
  interestList: string[],
  shared: boolean,
  isValid: {},
  isDirty: boolean
}
export interface TrainingIdHash {
  [indexer: string]: TrainingModel;
}

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

export interface TrainingVersion {
  readonly _id: string,
  version: string,
  pending: boolean,
  title: string,
  iconClass: string,
  iconColor: string,
  ownerId: string,
  dateCreated: number,
  changeLog: string,
}

export interface Page {
  _id: string,
  type: 'single' | 'double',
  title: string,
  content: Content[],
  intro: string,
  assessment: Assessment,
  
}

export interface Content {
  _id: string,
  type: 'file' | 'url' | 'video' | 'text' | 'none',
  file: string,
  url: string,
  text: string
}

export interface TrainingArchive {
  _id: string,
  trainings: TrainingModel[]
}