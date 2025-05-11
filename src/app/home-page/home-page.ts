import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AudioRecorderComponent } from '../audio-recorder.component';
import { GalleryComponent } from '../gallery.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent {
    constructor(private dialog: MatDialog) {}

    openProfileImage(): void {
      this.dialog.open(GalleryComponent, {
        width: '700px',
        maxHeight: '600px'
      });
    }
  
    openAudioRecorder(): void {
      this.dialog.open(AudioRecorderComponent, {
        width: '700px',
        maxHeight: '600px'

      });
    }
  }