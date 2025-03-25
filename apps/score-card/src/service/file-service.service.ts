import { Injectable } from '@angular/core';
import {
  Storage,
  UploadTask,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FileServiceService {
  constructor(private storage: Storage) {}

  pushFileToStorage(basePath: string, fileUpload: File): UploadTask {
    const filePath = `${basePath}/${fileUpload.name}`;
    const storageRef = ref(this.storage, filePath);

    const task = uploadBytesResumable(storageRef, fileUpload);

    task
      .then((x) => {
        console.log({ x });
      })
      .catch((error) => console.error(error));

    return task;
  }
}
