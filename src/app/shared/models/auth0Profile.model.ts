export class Auth0ProfileModel {
  constructor(
    public uid: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public userType: string
  ) { }
}
