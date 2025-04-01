import { Component, effect, input, model, signal } from '@angular/core';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-show-image',
  imports: [MatIconModule],
  templateUrl: './show-image.component.html',
  styleUrl: './show-image.component.css',
})
export class ShowImageComponent {
  filename = input.required<string>();
  URL = model<string>();

  errorMessage = signal('');
  found = signal(true);

  constructor() {
    const storage = getStorage();
    const storageRef = ref(storage);

    effect(() => {
      this.errorMessage.set('');
      this.found.set(true);
      const imageRef = ref(storageRef, this.filename());
      getDownloadURL(imageRef)
        .then(url => {
          this.URL.set(url);
        })
        .catch(error => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/object-not-found':
              this.URL.set('');
              this.found.set(false);
              this.errorMessage.set('Image has been deleted');
              break;

            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              this.found.set(false);
              this.errorMessage.set("YOu don't have access to this image");
              break;

            case 'storage/canceled':
              // User canceled the upload
              this.found.set(false);
              this.errorMessage.set('Upload was incomplete');
              break;

            default:
              // Unknown error occurred, inspect the server response
              this.errorMessage.set(`Failed to contact server: ${error.errorMessage}`);
              this.found.set(false);
              break;
          }
        });
    });
  }
}
