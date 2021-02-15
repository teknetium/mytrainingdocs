export interface EventModel {
  _id: string,
  title: string,
  url: string,
  type: string,
  userId: string,
  teamId: string,
  orgId: string,
  page: string,
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

export interface ResizeEvent {
  width: number,
  height: number,
}