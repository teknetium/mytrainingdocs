
export interface NotificationModel {
    _id: string,
    type: 'pastDue' | 'message' | 'newTraining' | 'trainingUpdated' | 'newUser' | 'trainingCompleted' | 'trainingAssignment',
    tid: string,
    uid: string,
    name: string,
    icon: string,
    iconSource: 'fontAwesome' | 'ngZorro',
    fgColor: string,
    bgColor: string
  }

export interface AlertModel {
  type: 'success' | 'info' | 'warning' | 'error',
  message: string
}