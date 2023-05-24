// export class Login {
//   public static readonly type = '[Auth] Login';
//   constructor() { }
// }

// export class Logout {
//   public static readonly type = '[Auth] Logout';
//   constructor() { }
// }

export class LogUserActivity {
  public static readonly type = '[Auth] Log User Activity';
  constructor(public username: string, public version: string) { }
}
