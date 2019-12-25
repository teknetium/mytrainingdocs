export interface EventModel {
  _id: string,
  userId: string
  name: string,
  type: 'trainingDue' | 'notificationToSend',
  creationDate: number,
  actionDate: number,
  teamId: string,
  description: string,
}
