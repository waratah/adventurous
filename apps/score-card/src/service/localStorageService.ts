import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly localStorage;

  constructor() {
    this.localStorage = inject(DOCUMENT)?.defaultView?.localStorage;
  }

  get<T>(key: string): T | null {
    const item = this.localStorage?.getItem(key);

    if (!item) {
      return null;
    }

    return this.isJSONValid(item) ? (JSON.parse(item) as T) : (item as T);
  }

  set(key: string, value: unknown): void {
    this.localStorage?.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.localStorage?.removeItem(key);
  }

  removeKeys(keys: string[]): void {
    keys.forEach(key => this.localStorage?.removeItem(key));
  }

  clear(): void {
    this.localStorage?.clear();
  }

  // TODO:  double decode...
  private isJSONValid(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
