export class AlertModel {
  constructor(
    public type: string,
    public name: string,
    public title: string,
    public body: string,
    public position: string,
    public visibility: boolean
  ) { }
}
