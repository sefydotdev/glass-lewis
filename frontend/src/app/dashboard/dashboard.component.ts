import { Component, OnInit } from '@angular/core';
import { AuthService } from "../services/auth/auth.service";
import { AuthStateService } from "../services/auth/auth-state.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  currentView: string = 'search';
  searchValue: string = '';

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
  ){ }

  ngOnInit(): void { }

  getGreetings(): string {
    const currentHour: number = new Date().getHours();
    const userName = this.authState.getName();

    switch (true) {
      case currentHour < 12:
        return `Morning, ${userName}`;
      case currentHour < 18:
        return `Afternoon, ${userName}`;
      default:
        return `Evening, ${userName}`;
    }
  }

  toggleView(view: string) {
    this.currentView = view;
  }

  logout() {
    this.authService.logout();
    this.authState.clearName();
  }

  emitValueToSearch(value: string): void {
    this.searchValue = value;
  }
}
