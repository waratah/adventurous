import { Component, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { FileServiceService } from '../../service/file-service.service';

const twoMb = 2 * 1024 * 1024;

@Component({
  selector: 'app-image-upload',
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css',
})
export class ImageUploadComponent {
  basePath = input.required<string>();
  currentFile?: File;
  progress = 0;
  errorMessage = '';

  fileName = 'Select File';
  fileInfos?: Observable<any>;

  constructor(private fileService: FileServiceService) {}

  // ngOnInit(): void {
  //   this.fileInfos = this.fileService.getFiles();
  // }

  selectFile(event: any): void {
    this.progress = 0;
    this.errorMessage = '';

    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
    } else {
      this.fileName = 'Select File';
    }
  }

  uploadFile(input: HTMLInputElement) {
    const errors: string[] = [];
    if (!input.files) return;

    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        if (file?.size < twoMb) {
          this.fileService
            .pushFileToStorage(this.basePath(), file)
            .catch((error) => {
              errors.push(error.message);
              this.errorMessage = errors.join();
            });
        } else {
          errors.push(`${file.name} is too large maximum is 2mb`);
          this.errorMessage = errors.join();
        }
      }
    }
    this.errorMessage = errors.join();
  }
}
