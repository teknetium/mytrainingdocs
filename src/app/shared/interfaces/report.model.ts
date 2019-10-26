export interface ReportModel {
  _id: string,
  title: string,
  org: string,
  description: string,
  recipients: string[],
  schedule: string,
  urls: string[],
  iconClass: string,
  iconColor: string,
}
