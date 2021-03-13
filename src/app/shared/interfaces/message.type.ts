export interface MessageModel {
  _id: string,
  uid: string,
  state: 'draft' | 'sent' | 'unread' | 'read',
  category: 'systemAlert' | 'userMessage',
  subCategory?: 'newTraining' | 'trainingUpdate' | 'pastDueNotification' | 'dueDateNotification' | 'verifyEmail' | 'registration',
  to: string,
  from: string,
  subject?: string,
  text?: string,
  sentDate?: number,
  receivedDate?: number,
  html?: string,
  mbox?: string,
  trainingId?: string,
  templateId?: string,
  dynamicTemplateData?: {}
}

export interface TemplateMessageModel {
  to: string
  from: string,
  templateId: string,
  dynamicTemplateData: {},
}
