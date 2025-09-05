import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() readonly: boolean = false;
  @Input() showValue: boolean = false;
  @Input() color: string = '#FF6A00'; // Primary color
  
  @Output() ratingChange = new EventEmitter<number>();
  
  hoverRating: number = 0;
  stars: number[] = [];
  
  constructor() {}
  
  ngOnInit(): void {
    this.stars = Array(this.maxRating).fill(0).map((_, i) => i + 1);
  }
  
  setRating(value: number): void {
    if (this.readonly) return;
    
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }
  
  setHoverRating(value: number): void {
    if (this.readonly) return;
    
    this.hoverRating = value;
  }
  
  resetHoverRating(): void {
    if (this.readonly) return;
    
    this.hoverRating = 0;
  }
  
  getStarClass(star: number): string {
    const rating = this.hoverRating || this.rating;
    
    if (star <= rating) {
      return 'filled';
    }
    
    // Handle half stars
    if (star - 0.5 <= rating) {
      return 'half';
    }
    
    return '';
  }
  
  getContainerClass(): string {
    let classes = 'rating-stars';
    
    if (this.size) {
      classes += ` size-${this.size}`;
    }
    
    if (this.readonly) {
      classes += ' readonly';
    }
    
    return classes;
  }
  
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }
}