import { SafeResourceUrl } from '@angular/platform-browser';

export interface FileModel {
  _id: string,
  name: string,
  mimeType: string,
  fileStackId: string,
  fileStackUrl: string,
  safeFileUrl: SafeResourceUrl,
  dateUploaded: number
}