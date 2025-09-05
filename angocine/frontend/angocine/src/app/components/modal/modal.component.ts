import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() centered: boolean = true;
  @Input() backdrop: boolean | 'static' = true;
  @Input() keyboard: boolean = true;
  @Input() animation: boolean = true;
  @Input() ignoreBackdropClick: boolean = false;
  
  @Output() closed = new EventEmitter<void>();
  
  @ViewChild('modalContent') modalContent!: ElementRef;
  
  modalRef?: BsModalRef;
  
  constructor() {}
  
  ngOnInit(): void {}
  
  close(): void {
    this.closed.emit();
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (this.ignoreBackdropClick) return;
    
    const target = event.target as HTMLElement;
    const modalContent = this.modalContent.nativeElement;
    
    if (!modalContent.contains(target)) {
      this.close();
    }
  }
  
  getModalClass(): string {
    let classes = 'modal-dialog';
    
    if (this.centered) {
      classes += ' modal-dialog-centered';
    }
    
    switch (this.size) {
      case 'sm':
        classes += ' modal-sm';
        break;
      case 'lg':
        classes += ' modal-lg';
        break;
      case 'xl':
        classes += ' modal-xl';
        break;
      default:
        // Default is medium, no additional class needed
        break;
    }
    
    return classes;
  }
}