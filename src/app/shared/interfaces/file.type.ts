import { Page } from "src/app/shared/interfaces/training.type";
import { SafeResourceUrl } from '@angular/platform-browser';

export interface FileModel {
  _id: string,
  name: string,
  mimeType: string,
  fileStackId: string,
  fileStackUrl: string,
  safeFileUrl: SafeResourceUrl,
  dateUploaded: number,
}

export interface FilePlusModel {
  _id: string,
  name: string,
  mimeType: string,
  fileStackId: string,
  fileStackUrl: string,
  safeFileUrl: SafeResourceUrl,
  dateUploaded: number,
  page: Page
}