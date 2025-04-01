import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ShowImageComponent } from '../../utils';

export interface DialogViewOptions {
  filename: string;
  URL: string;
}

@Component({
  selector: 'app-dialog-view',
  imports: [ShowImageComponent],
  templateUrl: './dialog-view.component.html',
  styleUrl: './dialog-view.component.css',
})
export class DialogViewComponent {
  filename = signal<string>('');
  URL = signal<string>('');

  constructor(@Inject(MAT_DIALOG_DATA) data: DialogViewOptions, private dialogRef: MatDialogRef<DialogViewComponent>) {
    if (data.filename) {
      this.filename.set(data.filename || '');
      this.URL.set(data.URL || '');
    } else {
      throw 'filename is required in DialogView';
    }
  }
}
