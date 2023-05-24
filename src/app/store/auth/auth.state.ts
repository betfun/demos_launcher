import { State, Action, StateContext, NgxsOnInit } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { AuthStateModel } from './auth.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LogUserActivity } from './auth.actions';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { serverTimestamp } from 'firebase/firestore';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    photoUrl: undefined,
    uid: undefined
  }
})
@Injectable({ providedIn: 'root' })
export class AuthState implements NgxsOnInit {

  constructor(private fb: AngularFirestore, private auth: AngularFireAuth) { }

  @Action(LogUserActivity)
  logUserActivity(ctx: StateContext<AuthStateModel>, { username, version }: LogUserActivity): void {
    this.fb.collection('Auth').doc(username).set({
      displayName: username,
      version,
      timestamp: serverTimestamp()
    }).catch(ret => console.log(ret));
  }

  // @Action(Login)
  // login(ctx: StateContext<AuthStateModel>): void {
  //   this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  // }

  // @Action(Logout)
  // logout(ctx: StateContext<AuthStateModel>): void {
  //   this.auth.signOut();
  // }

  ngxsOnInit(ctx: StateContext<AuthStateModel>): void {
    // this.auth.authState.subscribe(user => {
    //   if (user) {
    //     this.fb.collection('Auth').doc(user.uid).set({
    //       displayName: user.displayName,
    //       email: user.email,
    //       timestamp: serverTimestamp()
    //     });

    //     ctx.setState({
    //       uid: user?.uid,
    //       photoUrl: user?.photoURL
    //     });
    //   }
    //   else {
    //     ctx.setState(null);
    //   }
    // });
  }
}
