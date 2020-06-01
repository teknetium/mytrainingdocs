import { FileModel } from "src/app/shared/interfaces/file.type";
import { SafeResourceUrl } from '@angular/platform-browser';

export interface TrainingModel {
  _id: string,
  type: 'online' | 'system',
  versions: TrainingVersion[],
  category: string,
  subcategory: string,
  status: 'locked' | 'unlocked',
  title: string,
  teamId: string,
  owner: string,
  dateCreated: number,
  estimatedTimeToComplete: number,
  description: string,
  jobTitle: string,
  image: string,
  iconClass: string,
  iconColor: string,
  iconSource: string,
  pages: Page[],
  interestList: string[],
  shared: boolean,
  isDirty: boolean
}
export interface TrainingIdHash {
  [indexer: string]: TrainingModel;
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
  type: 'file' | 'url' | 'text' | 'assessment' | 'training-intro',
  title: string,
  text: string,
  content: Content
}

export interface Content {
  _id: string,
  type: 'file' | 'url' | 'video'  | 'audio' | 'text' | 'none' | 'image' | 'html' ,
  file: FileModel,
  text: string,
  webUrl: string,
}
