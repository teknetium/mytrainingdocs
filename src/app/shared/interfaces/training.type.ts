import { CalendarModule } from "src/app/components/calendar/calendar.module";

export interface TrainingModel {
  _id: string,
  type: 'online' | 'system',
  versions: TrainingVersion[],
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
  type: 'url' | 'file' | 'text',
  title: string,
  url: string,
  file: string,
  portlets: Portlet[],
  intro: string,
  icon: string,
  color: string,
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

export interface TrainingArchive {
  _id: string,
  trainings: TrainingModel[]
}