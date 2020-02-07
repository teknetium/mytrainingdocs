export interface EventModel {
  _id: string,
  title: string,
  type: 'user' | 'training' | 'userTraining' | 'loginSession' | 'trainingSession' | 'notification',
  userId: string,
  teamId: string,
  desc: string,
  mark: {
    iconClass: string,
    iconColor: string,
    useBadge: boolean,
    badgeColor: string
  },
  creationDate: number,
  actionDate: number,
}
