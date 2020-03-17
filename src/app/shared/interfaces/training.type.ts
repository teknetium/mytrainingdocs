import { CalendarModule } from "src/app/components/calendar/calendar.module";

export interface TrainingModel {
  _id: string,
  type: 'online' | 'system' ,
  versions: TrainingVersion[],
  versionsHash: {},
  versionPending: string,
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
  files: string[],
  pages: Page[],
  rating: number[],
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

export interface Comment {
  _id: string,
  author: string,
  content: string,
  avatar: string,
  children: Comment[]
}
export interface TrainingVersion {
  _id: string,
  version: string,
  title: string,
  iconClass: string,
  iconColor: string,
  ownerId: string,
  dateCreated: number,
  changeLog: string,
}

export interface Page {
  _id: string,
  type: 'url' | 'file' | 'text',
  title: string,
  url: string,
  file: string,
  portlets: Portlet[],
  intro: string
}

export interface Portlet {
  _id: string,
  file: string,
  width: number,
  height: number,
  xLoc: number,
  yLoc: number
}
export interface TextBlock {
  _id: string,
  content: string,
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

