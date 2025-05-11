import { Component, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import SwiperCore, { Swiper,Pagination } from 'swiper';
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GalleryComponent {
  images = ['assets/image1.jpg', 'assets/image2.webp', 'assets/image3.webp'];
  currentIndex = 0;
  swiperInstance!: Swiper;


  constructor(private cdRef: ChangeDetectorRef,private dialogRef: MatDialogRef<GalleryComponent>) {

  }
  ngAfterViewInit() {
    // Wait until the component is fully initialized
    setTimeout(() => {
      this.currentIndex = this.swiperInstance.activeIndex;
    });
  }

  onSwiperInit(swiper: Swiper) {
    this.swiperInstance = swiper;
    this.currentIndex = swiper.activeIndex;  // Ensure activeIndex is updated on initialization
    console.log('init',this.currentIndex);
  }

  // This method gets triggered on slide change
  onSlideChange(swiper: Swiper) {
    this.currentIndex = swiper[0].activeIndex;  // Update the current index on slide change
    console.log('change',this.currentIndex)
    this.cdRef.detectChanges();
    
  }

  onClose(): void {
    this.dialogRef.close();
  }
}