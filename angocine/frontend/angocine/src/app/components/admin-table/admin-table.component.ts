import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent implements OnInit {
  @Input() columns: { key: string, label: string, sortable?: boolean, width?: string }[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() sortKey: string = '';
  @Input() sortOrder: 'asc' | 'desc' = 'desc';
  @Input() showActions: boolean = true;
  @Input() actionButtons: { label: string, icon: string, class: string }[] = [
    { label: 'Editar', icon: 'fa-edit', class: 'btn-primary' },
    { label: 'Excluir', icon: 'fa-trash-alt', class: 'btn-danger' }
  ];
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ key: string, order: 'asc' | 'desc' }>();
  @Output() rowAction = new EventEmitter<{ action: string, item: any }>();
  @Output() rowClick = new EventEmitter<any>();
  
  constructor() {}
  
  ngOnInit(): void {}
  
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
  
  onSortChange(key: string): void {
    let order: 'asc' | 'desc' = 'asc';
    
    if (this.sortKey === key) {
      order = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    this.sortChange.emit({ key, order });
  }
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  onActionClick(action: string, item: any, event: Event): void {
    event.stopPropagation();
    this.rowAction.emit({ action, item });
  }
  
  getSortIcon(key: string): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  getColumnWidth(column: any): string {
    return column.width || 'auto';
  }
  
  getColumnClass(column: any): string {
    let classes = '';
    
    if (column.sortable) {
      classes += ' sortable';
    }
    
    if (this.sortKey === column.key) {
      classes += ' sorted';
    }
    
    return classes;
  }
  
  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, i) => o ? o[i] : null, obj);
  }
  
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}