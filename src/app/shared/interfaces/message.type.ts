export interface MessageModel {
  to: string
  from: string,
  subject: string,
  text: string,
  html: string
}
export interface TemplateMessageModel {
  to: string
  from: string,
  templateId: string,
  dynamicTemplateData: {},
}
