import { Component, Inject, signal } from '@angular/core';
import { UploadImageComponent } from '../../utils/';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploadParameters, UploadResult } from '../../definitions';

@Component({
  selector: 'app-dialog-upload',
  imports: [UploadImageComponent],
  templateUrl: './dialog-upload.component.html',
  styleUrl: './dialog-upload.component.css',
})
export class DialogUploadComponent {
  twoMb = 2 * 1024 * 1024;

  multiple = signal(false);
  fileMaxSize = signal(this.twoMb);
  fileMaxCount = signal(10);
  directory = signal('misc');
  fileExtensions = signal(['jpg', 'jpeg', 'png', 'pdf']);

  constructor(@Inject(MAT_DIALOG_DATA) data: UploadParameters, private dialogRef: MatDialogRef<DialogUploadComponent>) {
    if (data.directory) {
      this.directory.set(data.directory);
    } else {
      throw 'directory is a required field in dialog parameters';
    }
    if (data.multiple !== undefined) {
      this.multiple.set(data.multiple);
    }

    if (data.fileMaxSize !== undefined) {
      this.fileMaxSize.set(data.fileMaxSize);
    }

    if (data.fileMaxCount !== undefined) {
      this.fileMaxCount.set(data.fileMaxCount);
    }
  }

  close(result: UploadResult) {
    this.dialogRef.close(result);
  }
}
