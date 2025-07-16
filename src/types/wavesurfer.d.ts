//src/types/wavesurfer.d.ts

declare module 'wavesurfer.js' {
    interface WaveSurferOptions {
      container: string | HTMLElement;
      waveColor?: string;
      progressColor?: string;
      height?: number;
      responsive?: boolean;
      barWidth?: number;
      interact?: boolean;
      cursorWidth?: number;
    }
  
    interface WaveSurfer {
      load: (url: string) => void;
      play: () => void;
      pause: () => void;
      destroy: () => void;
      playPause: () => void;
  
      // ✅ Bổ sung 'on' để đăng ký sự kiện
      on: (event: string, callback: (...args: any[]) => void) => void;
    }
  
    const WaveSurfer: {
      create: (options: WaveSurferOptions) => WaveSurfer;
    };
  
    export default WaveSurfer;
  }
  