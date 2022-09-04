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

import { HomeComponent } from './home/home.component';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { ConfigState } from './store/config/state';
import { OrgsState } from './store/orgs/state';
import { ConfigComponent } from './config/config.component';
import { OrgSetupComponent } from './org-setup/org-setup.component';
import { ProfileLineComponent } from './org-setup/profile-line/profile-line.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'edit/:id', component: OrgSetupComponent },
  { path: 'new', component: OrgSetupComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

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
    NgxsModule.forRoot([ConfigState, OrgsState]),
    NgxsLoggerPluginModule.forRoot(),
    RouterModule.forRoot(routes)
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'standard'}}
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
