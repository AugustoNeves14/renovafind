import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { User, Profile } from '../../models/user.model';
import { WatchHistoryItem, WatchlistItem } from '../../models/movie.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  currentProfile: Profile | null = null;
  profiles: Profile[] = [];
  
  watchlist: WatchlistItem[] = [];
  watchHistory: WatchHistoryItem[] = [];
  
  userForm: FormGroup;
  profileForm: FormGroup;
  
  isLoading = true;
  isLoadingWatchlist = false;
  isLoadingHistory = false;
  isUpdatingUser = false;
  isUpdatingProfile = false;
  isCreatingProfile = false;
  isDeletingProfile = false;
  
  error: string | null = null;
  userUpdateError: string | null = null;
  profileUpdateError: string | null = null;
  
  activeTab = 'profile';
  showProfileSelector = false;
  showAddProfileForm = false;
  showEditProfileForm = false;
  profileToEdit: Profile | null = null;
  
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      current_password: [''],
      new_password: [''],
      confirm_password: ['']
    });
    
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      avatar: [''],
      is_kid: [false]
    });
  }
  
  ngOnInit(): void {
    // Check if user is logged in
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (!user) {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/profile' } });
        return;
      }
      
      // Load user data
      this.loadUserData();
    });
    
    // Get current profile
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
      
      if (profile) {
        // Load watchlist and history
        this.loadWatchlist();
        this.loadWatchHistory();
      }
    });
    
    // Check for tab in query params
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }
  
  loadUserData(): void {
    this.isLoading = true;
    
    this.userService.getProfile().subscribe(
      response => {
        // Update user form
        this.userForm.patchValue({
          username: response.data.user.username,
          email: response.data.user.email
        });
        
        // Update profiles
        this.profiles = response.data.profiles;
        this.authService.updateProfiles(response.data.profiles);
        
        this.isLoading = false;
      },
      error => {
        console.error('Error loading user data:', error);
        this.error = 'Erro ao carregar dados do usuário. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }
  
  loadWatchlist(): void {
    if (!this.currentProfile) return;
    
    this.isLoadingWatchlist = true;
    
    this.userService.getWatchlist().subscribe(
      response => {
        this.watchlist = response.data.watchlist;
        this.isLoadingWatchlist = false;
      },
      error => {
        console.error('Error loading watchlist:', error);
        this.isLoadingWatchlist = false;
      }
    );
  }
  
  loadWatchHistory(): void {
    if (!this.currentProfile) return;
    
    this.isLoadingHistory = true;
    
    this.userService.getWatchHistory(this.currentProfile.id).subscribe(
      response => {
        this.watchHistory = response.data.history;
        this.isLoadingHistory = false;
      },
      error => {
        console.error('Error loading watch history:', error);
        this.isLoadingHistory = false;
      }
    );
  }
  
  updateUserProfile(): void {
    if (this.userForm.invalid) return;
    
    const formData = this.userForm.value;
    
    // Validate passwords if changing
    if (formData.new_password) {
      if (!formData.current_password) {
        this.userUpdateError = 'Por favor, informe sua senha atual para alterá-la.';
        return;
      }
      
      if (formData.new_password !== formData.confirm_password) {
        this.userUpdateError = 'A nova senha e a confirmação não coincidem.';
        return;
      }
    }
    
    this.isUpdatingUser = true;
    this.userUpdateError = null;
    
    // Prepare data for update
    const updateData: any = {
      username: formData.username,
      email: formData.email
    };
    
    if (formData.new_password) {
      updateData.current_password = formData.current_password;
      updateData.new_password = formData.new_password;
    }
    
    this.userService.updateProfile(updateData).subscribe(
      response => {
        this.isUpdatingUser = false;
        
        // Reset password fields
        this.userForm.patchValue({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Reload user data
        this.loadUserData();
      },
      error => {
        console.error('Error updating user profile:', error);
        this.userUpdateError = 'Erro ao atualizar perfil. Verifique os dados e tente novamente.';
        this.isUpdatingUser = false;
      }
    );
  }
  
  openProfileSelector(): void {
    this.showProfileSelector = true;
  }
  
  closeProfileSelector(): void {
    this.showProfileSelector = false;
  }
  
  selectProfile(profile: Profile): void {
    this.authService.setCurrentProfile(profile);
    this.closeProfileSelector();
    
    // Reload watchlist and history
    this.loadWatchlist();
    this.loadWatchHistory();
  }
  
  openAddProfileForm(): void {
    this.showAddProfileForm = true;
    this.profileForm.reset({
      name: '',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      is_kid: false
    });
  }
  
  closeAddProfileForm(): void {
    this.showAddProfileForm = false;
  }
  
  createProfile(): void {
    if (this.profileForm.invalid) return;
    
    const formData = this.profileForm.value;
    
    this.isCreatingProfile = true;
    this.profileUpdateError = null;
    
    this.userService.createProfile(formData.name, formData.avatar, formData.is_kid).subscribe(
      response => {
        this.isCreatingProfile = false;
        this.closeAddProfileForm();
        
        // Reload user data
        this.loadUserData();
        
        // If no current profile, set this as current
        if (!this.currentProfile) {
          this.selectProfile(response.data.profile);
        }
      },
      error => {
        console.error('Error creating profile:', error);
        this.profileUpdateError = 'Erro ao criar perfil. Por favor, tente novamente.';
        this.isCreatingProfile = false;
      }
    );
  }
  
  openEditProfileForm(profile: Profile): void {
    this.profileToEdit = profile;
    this.showEditProfileForm = true;
    
    this.profileForm.patchValue({
      name: profile.name,
      avatar: profile.avatar,
      is_kid: profile.is_kid
    });
  }
  
  closeEditProfileForm(): void {
    this.showEditProfileForm = false;
    this.profileToEdit = null;
  }
  
  updateProfile(): void {
    if (this.profileForm.invalid || !this.profileToEdit) return;
    
    const formData = this.profileForm.value;
    
    this.isUpdatingProfile = true;
    this.profileUpdateError = null;
    
    this.userService.updateProfile(this.profileToEdit.id, {
      name: formData.name,
      avatar: formData.avatar,
      is_kid: formData.is_kid
    }).subscribe(
      response => {
        this.isUpdatingProfile = false;
        this.closeEditProfileForm();
        
        // Reload user data
        this.loadUserData();
        
        // If this is the current profile, update it
        if (this.currentProfile && this.currentProfile.id === this.profileToEdit?.id) {
          this.selectProfile(response.data.profile);
        }
      },
      error => {
        console.error('Error updating profile:', error);
        this.profileUpdateError = 'Erro ao atualizar perfil. Por favor, tente novamente.';
        this.isUpdatingProfile = false;
      }
    );
  }
  
  deleteProfile(profile: Profile): void {
    if (confirm(`Tem certeza que deseja excluir o perfil "${profile.name}"? Esta ação não pode ser desfeita.`)) {
      this.isDeletingProfile = true;
      
      this.userService.deleteProfile(profile.id).subscribe(
        response => {
          this.isDeletingProfile = false;
          
          // Reload user data
          this.loadUserData();
          
          // If this is the current profile, clear it
          if (this.currentProfile && this.currentProfile.id === profile.id) {
            // Select another profile if available
            if (this.profiles.length > 1) {
              const otherProfile = this.profiles.find(p => p.id !== profile.id);
              if (otherProfile) {
                this.selectProfile(otherProfile);
              }
            } else {
              // No profiles left
              this.authService.setCurrentProfile(null);
              this.currentProfile = null;
            }
          }
        },
        error => {
          console.error('Error deleting profile:', error);
          alert('Erro ao excluir perfil. Por favor, tente novamente.');
          this.isDeletingProfile = false;
        }
      );
    }
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}