import { SafeResourceUrl } from '@angular/platform-browser';

export interface FileModel {
  _id: string,
  teamId: string,
  description: string,
  iconClass: string,
  iconType: 'pdf' | 'doc' | 'xls' | 'ppt' | 'txt' | 'image' | 'video' | 'audio' | 'unknown' | 'html',
  iconColor: string,
  iconSource: 'fontawesome' | 'ngZorro',
  versions: Version[],
}

export interface Version {
  _id: string,
  version: string,
  fileName: string,
  size: string,
  changeLog: string,
  mimeType: string,
  owner: string,
  fsHandle: string,
  url: string,
  safeUrl: string,
  dateUploaded: number
}