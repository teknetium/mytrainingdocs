
export interface NotificationModel {
    _id: string,
    type: 'pastDue',
    
    tid: string,
    status: string,
    dueDate: number,
//    public schedule: ScheduleItem[],
    iconClass: string,
    iconColor: string
  }

export interface ScheduleItem {
    daysPrior: number,
    recipients: Array<string>,
    message: string,
}
