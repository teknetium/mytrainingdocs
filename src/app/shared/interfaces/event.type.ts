export interface EventModel {
  _id: string,
  userId: string
  name: string,
  type: 'trainingDue' | 'notificationToSend | newComment | newTraining | trainingUpdate | newUser | trainingCommpleted | system',
  creationDate: number,
  actionDate: number,
  teamId: string,
  description: string,
}
