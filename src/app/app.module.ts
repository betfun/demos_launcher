import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { HomeComponent } from './home/home.component';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { ConfigState } from './store/config/state';
import { OrgsState } from './store/orgs/state';
import { ConfigComponent } from './config/config.component';
import { OrgSetupComponent } from './org-setup/org-setup.component';
import { ProfileLineComponent } from './org-setup/profile-line/profile-line.component';
import { TasksState } from './store/chrome/state';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'edit/:id', component: OrgSetupComponent },
  { path: 'new', component: OrgSetupComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD5M1Zg5d4s1QHbFGFQGhJNlVIot41b7M8',
  authDomain: 'demos-launcher.firebaseapp.com',
  databaseURL: 'https://demos-launcher-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'demos-launcher',
  storageBucket: 'demos-launcher.appspot.com',
  messagingSenderId: '783594879691',
  appId: '1:783594879691:web:dae3895efb964e0dd8394e'
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConfigComponent,
    OrgSetupComponent,
    ProfileLineComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatListModule,
    MatStepperModule,
    MatMenuModule,
    ClipboardModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    DragDropModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxsModule.forRoot([ConfigState, OrgsState, TasksState]),
    NgxsLoggerPluginModule.forRoot(),
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
