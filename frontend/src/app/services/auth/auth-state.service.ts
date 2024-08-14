import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly NAME_KEY = 'userName';

  constructor() { }

  setName(name: string): void {
    sessionStorage.setItem(this.NAME_KEY, name);
  }

  getName(): string | null {
    const storedName = sessionStorage.getItem(this.NAME_KEY);
    return (storedName !== null ? storedName : 'Default User');
  }

  clearName(): void {
    sessionStorage.removeItem(this.NAME_KEY);
  }
}
