import { Injectable } from '@angular/core';
import { UploadTask, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FileServiceService {
  private readonly storage = getStorage();

  pushFileToStorage(basePath: string, fileUpload: File): UploadTask {
    const filePath = `${basePath}/${fileUpload.name}`;
    const storageRef = ref(this.storage, filePath);

    const task = uploadBytesResumable(storageRef, fileUpload);

    task
      .then(x => {
        console.log({ x });
      })
      .catch(error => console.error(error));

    return task;
  }
}
