export class SessionLogModel {
  constructor(
    public type: string,
    public org: string,
    public uid: string,
    public startTime: number,
    public endTime: number,
    public trainingId: string,
  ) { }
}
