import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';

export interface ConfirmationOptions {
  heading?: string;
  message?: string;
  cancelText?: string;
  continueText?: string;
}

@Component({
  selector: 'app-dialog-confirm',
  imports: [MatToolbar, MatButton, MatDialogModule],
  templateUrl: './dialog-confirm.component.html',
  styleUrl: './dialog-confirm.component.css',
})
export class DialogConfirmComponent {
  heading = signal<string>('Please confirm');
  message = signal<string>('Click OK to continue');
  cancelText = signal<string>('Don\'t do it');
  continueText = signal<string>('Continue');

  constructor(@Inject(MAT_DIALOG_DATA) data: ConfirmationOptions, private dialogRef: MatDialogRef<DialogConfirmComponent>) {
    if (data.message) {
      this.message.set(data.message);
    } else {
      throw 'directory is a required field in dialog parameters';
    }
    if (data.heading) {
      this.message.set(data.heading);
    }

    if (data.cancelText) {
      this.cancelText.set(data.cancelText);
    }

    if (data.continueText) {
      this.continueText.set(data.continueText);
    }
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
