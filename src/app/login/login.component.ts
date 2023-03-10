import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {

  }

  async login() {
    await this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }
}

