import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { AuthStateModel } from './auth.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Login, Logout } from './auth.actions';
import firebase from 'firebase/compat/app';
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

  @Selector()
  static userId(state: AuthStateModel) {
    return state.uid;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>): void {
    this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    this.auth.signOut();
  }

  ngxsOnInit(ctx: StateContext<AuthStateModel>): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.fb.collection('Auth').doc(user.uid).set({
          displayName: user.displayName,
          email: user.email,
          timestamp: serverTimestamp()
        });

        ctx.setState({
          uid: user?.uid,
          photoUrl: user?.photoURL
        });
      }
      else {
        ctx.setState(null);
      }

    });
  }
}
