import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-category-strip',
  templateUrl: './category-strip.component.html',
  styleUrls: ['./category-strip.component.scss']
})
export class CategoryStripComponent implements OnInit {
  @Input() title: string = '';
  @Input() movies: Movie[] = [];
  @Input() genre: string = '';
  @Input() showSeeAll: boolean = true;
  @Input() cardSize: 'small' | 'medium' | 'large' = 'medium';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {}
  
  seeAll(): void {
    if (this.genre) {
      this.router.navigate(['/browse'], { queryParams: { genre: this.genre } });
    } else {
      this.router.navigate(['/browse']);
    }
  }
}