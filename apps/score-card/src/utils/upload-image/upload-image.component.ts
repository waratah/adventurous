import { Component, effect, input, output, signal } from '@angular/core';
import { getDownloadURL, getStorage, ref, StorageReference, uploadBytesResumable } from '@angular/fire/storage';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UploadResult } from '../../definitions';

@Component({
  selector: 'app-upload-image',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css',
})
export class UploadImageComponent {
  files = output<UploadResult>();

  directory = input.required<string>();

  multiple = input(false);
  fileMaxSize = input<number>();
  fileMaxCount = input<number>();
  accept = input<string>();
  fileExtensions = input<string[]>();
  fileInputCapture = input<string>();

  errorMessage = signal<string>('');
  progress = signal(0);

  private storage = getStorage();

  // Points to the root reference
  private storageRef = ref(this.storage);

  // Points to 'upload' directory - should be overwritten
  private uploadRef: StorageReference = ref(this.storageRef, 'upload');

  /**
   *
   */
  constructor() {
    effect(() => {
      this.uploadRef = ref(this.storageRef, this.directory());
    });
  }

  dropHandler(ev: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file(s)
      Array.from(ev.dataTransfer.items).forEach(item => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            this.loadFile(file);
          }
        }
      });
    } else if (ev.dataTransfer?.files) {
      // Use DataTransfer interface to access the file(s)
      Array.from(ev.dataTransfer.files).forEach(file => {
        this.loadFile(file);
      });
    }
  }

  dragOverHandler(ev: Event) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  onDragLeave(ev: Event) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  onChange(files: FileList | null): void {
    if (files) {
      Array.from(files).forEach(file => {
        this.loadFile(file);
      });
    }
  }

  loadFile(file: File) {
    this.errorMessage.set('');
    console.log(`… ${file.name}`);
    console.log({ file });

    const uploadName = `${this.directory()}/${file.name}`;

    const storageRef = ref(this.uploadRef, file.name);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        this.progress.set(progress);

        console.log({ progress, snapshot });
      },
      error => {
        console.error({ error });
        this.errorMessage.set(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          const result: UploadResult = {
            filenames: [uploadName],
            urls: [downloadURL],
          };

          this.files.emit(result);
        });
      }
    );
  }
}
