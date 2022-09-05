import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom, Observable } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  dialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(private dialog: MatDialog) { }

  public open(options): Promise<any> {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: options.title,
        message: options.message,
        cancelText: options.cancelText,
        confirmText: options.confirmText
      }
    });

    const response$ = this.dialogRef.afterClosed();

    return firstValueFrom(response$);
  }
}
