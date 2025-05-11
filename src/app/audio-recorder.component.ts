import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AudioRecorderComponent {
  @ViewChild('waveCanvas') waveCanvas!: ElementRef<HTMLCanvasElement>;

  private mediaRecorder!: MediaRecorder;
  private stream!: MediaStream;
  private chunks: Blob[] = [];
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private sourceNode!: MediaStreamAudioSourceNode;
  private dataArray!: Uint8Array;
  private animationId: number = 0;

  recordings: { url: string; duration: number }[] = [];
  isRecording = false;
  isPaused = false;
  timerInterval: any;
  elapsedTime = 0;
  totalElapsed = 0;
  maxDuration = 5; // max duration of each chunk in seconds
  maxTotalDuration = 600; // 10 minutes total limit
  isStopRecordingTriggered: boolean  =false;

  constructor(private dialogRef: MatDialogRef<AudioRecorderComponent>) {

  }

  startRecording(): void {
    this.isStopRecordingTriggered = false;
    this.recordings = [];
    this.totalElapsed = 0;
    this.startNewChunk();
  }

  private startNewChunk(): void {
    this.chunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        if (this.chunks.length > 0) {
          const blob = new Blob(this.chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const duration = this.elapsedTime;
          this.recordings.push({ url, duration });
        }

        this.cleanupStream();

        if (this.totalElapsed < this.maxTotalDuration) {
          this.startNewChunk(); // Continue next chunk
        } else {
          this.stopAnimation();
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.elapsedTime = 0;

      this.startTimer();
      this.animateWaveFromMic();
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private startTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedTime++;
        this.totalElapsed++;

        if (this.elapsedTime >= this.maxDuration || this.totalElapsed >= this.maxTotalDuration) {
          this.mediaRecorder.stop();
          clearInterval(this.timerInterval);

          if (this.totalElapsed >= this.maxTotalDuration) {
            this.isRecording = false;
            this.stopAnimation();
          }
        }
      }
    }, 1000);
  }

  stopRecording(): void {
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      this.mediaRecorder.stop();
      this.isStopRecordingTriggered = true;
      this.isRecording = false;
      clearInterval(this.timerInterval);
      this.stopAnimation();
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      clearInterval(this.timerInterval);
      this.freezeWave();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.startTimer();
      this.animateWaveFromMic();
    }
  }

  private animateWaveFromMic(): void {
    const canvas = this.waveCanvas?.nativeElement;
    let ctx
    if(canvas) {
      ctx = canvas.getContext('2d')!;
      canvas.width = 300;
      canvas.height = 100;
    }
    
  
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
    }
  
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 64;
  
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.sourceNode.connect(this.analyser);
  
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  
    const centerY = canvas.height / 2;
    const barCount = 40;
    const barWidth = canvas.width / (barCount * 1.5);
    const gap = barWidth * 0.5;
  
    const draw = () => {
      if (!this.isRecording && !this.isPaused) {
        // Stop drawing when not recording or paused
        this.stopAnimation();
        return;
      }
  
      this.analyser.getByteFrequencyData(this.dataArray);
      const avgVolume = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
      const volumeFactor = avgVolume / 255;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      for (let i = 0; i < barCount; i++) {
        const value = this.dataArray[i];
        const barHeight = (value / 255) * centerY * volumeFactor + 5;
        const x = i * (barWidth + gap);
  
        ctx.fillStyle = '#1DB954';
        ctx.shadowColor = '#1DB954';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, centerY - barHeight, barWidth, barHeight * 2);
      }
  
      this.animationId = requestAnimationFrame(draw);
    };
  
    this.animationId = requestAnimationFrame(draw);
  }
  
  freezeWave(): void {
    if (!this.analyser || !this.waveCanvas) return;
  
    const canvas = this.waveCanvas?.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    const centerY = canvas.height / 2;
    const barCount = 40;
    const barWidth = canvas.width / (barCount * 1.5);
    const gap = barWidth * 0.5;
  
    this.analyser.getByteFrequencyData(dataArray);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i];
      const barHeight = (value / 255) * centerY + 5;
      const x = i * (barWidth + gap);
  
      ctx.fillStyle = '#1DB954';
      ctx.shadowColor = '#1DB954';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, centerY - barHeight, barWidth, barHeight * 2);
    }
  
    cancelAnimationFrame(this.animationId); // stop continuous animation
  }
  

  private stopAnimation(): void {
    cancelAnimationFrame(this.animationId);
  
    const ctx = this.waveCanvas.nativeElement?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.waveCanvas.nativeElement?.width, this.waveCanvas.nativeElement?.height);
    }
  
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  private cleanupStream(): void {
    this.stream.getTracks().forEach(track => track.stop());
  }

  playRecording(index: number): void {
    const audio = new Audio(this.recordings[index].url);
    audio.play();
  }

  clearRecording(): void {
    this.recordings = [];
    this.isRecording = false;
    this.isPaused = false;
    this.totalElapsed = 0;
    this.elapsedTime = 0;
    clearInterval(this.timerInterval);
    this.stopAnimation();
  }
}
