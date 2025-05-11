import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { GalleryComponent } from './gallery.component';
import { AudioRecorderComponent } from './audio-recorder.component';
import { SwiperModule } from 'swiper/angular';
import { HomePageComponent } from './home-page/home-page';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    AppComponent,
    GalleryComponent,
    AudioRecorderComponent,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SwiperModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }