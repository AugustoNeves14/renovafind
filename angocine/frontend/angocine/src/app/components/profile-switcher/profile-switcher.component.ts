import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-switcher',
  templateUrl: './profile-switcher.component.html',
  styleUrls: ['./profile-switcher.component.scss']
})
export class ProfileSwitcherComponent implements OnInit {
  @Input() showAddButton: boolean = true;
  @Input() showManageButton: boolean = true;
  @Output() profileSelected = new EventEmitter<Profile>();
  
  profiles: Profile[] = [];
  currentProfile: Profile | null = null;
  isLoading = true;
  
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    // Get current profile
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
    });
    
    // Load profiles
    this.loadProfiles();
  }
  
  loadProfiles(): void {
    this.isLoading = true;
    
    this.userService.getProfiles().subscribe(
      response => {
        this.profiles = response.data.profiles;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading profiles:', error);
        this.isLoading = false;
      }
    );
  }
  
  selectProfile(profile: Profile): void {
    this.authService.setCurrentProfile(profile);
    this.profileSelected.emit(profile);
  }
  
  isCurrentProfile(profile: Profile): boolean {
    return this.currentProfile?.id === profile.id;
  }
}