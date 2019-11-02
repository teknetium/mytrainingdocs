export interface FileModel {
  _id: string,
  name: string,
  size: string,
  mimeType: string,
  teamId: string,
  description: string,
  versions: [{version: string, changeLog: string, owner: string, fsHandle: string, url: string, dateUploaded: number} | null],
  iconClass: string,
  iconType: 'pdf' | 'doc' | 'xls' | 'ppt' | 'txt' | 'image' | 'video' | 'audio' | 'unknown' | 'html',
  iconColor: string,
  iconSource: 'fontawesome' | 'ngZorro',
  tags: string[]
}
