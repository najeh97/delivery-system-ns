import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserType } from '../models/user-type.enum';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Check if user is already logged in
    const storedUser = this.storageService.get('currentUser') as User | null;
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  register(user: User): Observable<User> {
    const users: User[] = (this.storageService.get('users') as User[]) || [];

    // Check if email already exists
    const existingUser = users.find((u) => u.email === user.email);
    if (existingUser) {
      // Use properly typed error response instead of 'any'
      return of({ ...user, error: 'Email already in use' } as User & { error: string });
    }

    // Generate a unique ID
    const newUser = { ...user, id: this.generateUniqueId() };
    users.push(newUser);

    this.storageService.set('users', users);
    return of(newUser);
  }

  login(email: string, password: string): Observable<User | null> {
    const users: User[] = (this.storageService.get('users') as User[]) || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      this.storageService.set('currentUser', user);
      this.currentUserSubject.next(user);
      return of(user);
    }

    return of(null);
  }

  logout(): void {
    this.storageService.remove('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserType): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.userType === role;
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
