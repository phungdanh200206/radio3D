/**
 * Audio Player with Volume Control, Album Playlist, and SoundCloud Widget API Integration
 * Album: Tam Thái Tử - Jack (J97) & Official SoundCloud Tracks
 */

export const TRACK_PLAYLIST = [
  {
    id: 'sc-1',
    type: 'soundcloud',
    title: 'Người Dưng (Album Tam Thái Tử)',
    artist: 'Jack - J97',
    genre: 'Tam Thái Tử No.2',
    scUrl: 'https://api.soundcloud.com/tracks/2391600861',
    permalinkUrl: 'https://soundcloud.com/qu-ph-m-573788822/jack-j97-ng-i-d-ng-album-tam',
    trackId: '2391600861',
    badge: 'SoundCloud',
    bpm: 108
  },
  {
    id: 'sc-2',
    type: 'soundcloud',
    title: 'Lưu Niên (Album Tam Thái Tử)',
    artist: 'Jack - J97',
    genre: 'Tam Thái Tử No.4',
    scUrl: 'https://api.soundcloud.com/tracks/2390898405',
    permalinkUrl: 'https://soundcloud.com/qu-ph-m-573788822/jack-j97-l-u-ni-n-album-tam-2',
    trackId: '2390898405',
    badge: 'SoundCloud',
    bpm: 112
  },
  {
    id: 'sc-3',
    type: 'soundcloud',
    title: 'Anh Yêu Em (我爱你)',
    artist: 'Jack - J97',
    genre: 'Tam Thái Tử No.3',
    scUrl: 'https://api.soundcloud.com/tracks/2390923173',
    permalinkUrl: 'https://soundcloud.com/qu-ph-m-573788822/jack-j97-anh-y-u-em-album-tam',
    trackId: '2390923173',
    badge: 'SoundCloud',
    bpm: 100
  },
  {
    id: 'sc-4',
    type: 'soundcloud',
    title: 'Hoa Trong Đá (Album Tam Thái Tử)',
    artist: 'Jack - J97',
    genre: 'Tam Thái Tử No.1',
    scUrl: 'https://api.soundcloud.com/tracks/2390838744',
    permalinkUrl: 'https://soundcloud.com/qu-ph-m-573788822/jack-j97-hoa-trong-a-1',
    trackId: '2390838744',
    badge: 'SoundCloud',
    bpm: 115
  },
  {
    id: 'sc-5',
    type: 'soundcloud',
    title: 'Nát Tan Cõi Lòng',
    artist: 'Jack - J97',
    genre: 'Album Tam Thái Tử',
    scUrl: 'https://api.soundcloud.com/tracks/2395329492',
    permalinkUrl: 'https://soundcloud.com/hyan3/nat-tan-coi-long-jack-j97',
    trackId: '2395329492',
    badge: 'SoundCloud',
    bpm: 95
  },
  {
    id: 'sc-6',
    type: 'soundcloud',
    title: 'Tam Thái Tử',
    artist: 'Jack - J97',
    genre: 'Ca Khúc Chủ Đề',
    scUrl: 'https://api.soundcloud.com/tracks/2395226430',
    permalinkUrl: 'https://soundcloud.com/hyan3/tam-th-i-t-jack-j97',
    trackId: '2395226430',
    badge: 'SoundCloud',
    bpm: 105
  },
  {
    id: 'sc-7',
    type: 'soundcloud',
    title: 'Mỗi Lần Nhớ Em Là Một Ngày Mưa',
    artist: 'Jack - J97',
    genre: 'Album Tam Thái Tử',
    scUrl: 'https://api.soundcloud.com/tracks/2394966276',
    permalinkUrl: 'https://soundcloud.com/hyan3/m-i-l-n-nh-em-l-m-t-ng-y-m-a',
    trackId: '2394966276',
    badge: 'SoundCloud',
    bpm: 90
  }
];

export class SummerAudioPlayer {
  constructor(onTrackChange, onPlayStateChange) {
    this.playlist = [...TRACK_PLAYLIST];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.7; // 0.0 to 1.0
    this.isMuted = false;
    this.onTrackChange = onTrackChange;
    this.onPlayStateChange = onPlayStateChange;

    // Web Audio Synthesizer fallback
    this.audioCtx = null;
    this.musicTimer = null;
    this.stepIndex = 0;
    this.masterGain = null;
    this.analyser = null;

    // SoundCloud Widget API
    this.scIframe = null;
    this.scWidget = null;
    this.isScReady = false;
  }

  attachSoundCloudWidget(iframeElement) {
    this.scIframe = iframeElement;
    if (typeof window !== 'undefined' && window.SC && window.SC.Widget && iframeElement) {
      try {
        this.scWidget = window.SC.Widget(iframeElement);
        this.scWidget.bind(window.SC.Widget.Events.READY, () => {
          this.isScReady = true;
          const scVol = this.isMuted ? 0 : this.volume * 100;
          this.scWidget.setVolume(scVol);
        });

        this.scWidget.bind(window.SC.Widget.Events.PLAY, () => {
          this.isPlaying = true;
          this.stopSynth();
          if (this.onPlayStateChange) this.onPlayStateChange(true);
        });

        this.scWidget.bind(window.SC.Widget.Events.PAUSE, () => {
          this.isPlaying = false;
          if (this.onPlayStateChange) this.onPlayStateChange(false);
        });

        this.scWidget.bind(window.SC.Widget.Events.FINISH, () => {
          this.isPlaying = false;
          if (this.onPlayStateChange) this.onPlayStateChange(false);
          this.next();
        });
      } catch (err) {
        console.warn('SoundCloud Widget bind warning:', err);
      }
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex];
  }

  initAudio() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume * 0.35, this.audioCtx.currentTime);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  stopSynth() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.audioCtx && this.masterGain) {
      const actualGain = this.isMuted ? 0 : this.volume * 0.35;
      this.masterGain.gain.setValueAtTime(actualGain, this.audioCtx.currentTime);
    }
    if (this.scWidget) {
      try {
        const scVol = this.isMuted ? 0 : this.volume * 100;
        this.scWidget.setVolume(scVol);
      } catch (e) {}
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  play() {
    const track = this.getCurrentTrack();

    if (track.type === 'soundcloud') {
      this.stopSynth();
      if (this.scWidget) {
        try {
          this.scWidget.play();
        } catch (e) {
          console.warn('SC play error:', e);
        }
      }
      this.isPlaying = true;
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    } else {
      // Synth fallback
      if (this.scWidget) {
        try { this.scWidget.pause(); } catch (e) {}
      }
      this.initAudio();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.startMusicLoop();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    }
  }

  pause() {
    const track = this.getCurrentTrack();
    if (track.type === 'soundcloud') {
      if (this.scWidget) {
        try { this.scWidget.pause(); } catch (e) {}
      }
    } else {
      this.stopSynth();
    }
    this.isPlaying = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    this.selectTrack((this.currentIndex + 1) % this.playlist.length);
  }

  prev() {
    this.selectTrack((this.currentIndex - 1 + this.playlist.length) % this.playlist.length);
  }

  selectTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
      const track = this.getCurrentTrack();
      if (this.onTrackChange) this.onTrackChange(track);

      if (track.type === 'soundcloud') {
        this.stopSynth();
        if (this.scWidget) {
          try {
            this.scWidget.load(track.scUrl, {
              auto_play: true,
              color: '#ff5500',
              show_artwork: true,
              callback: () => {
                const scVol = this.isMuted ? 0 : this.volume * 100;
                this.scWidget.setVolume(scVol);
                this.scWidget.play();
              }
            });
            this.isPlaying = true;
            if (this.onPlayStateChange) this.onPlayStateChange(true);
          } catch (e) {
            console.warn('SC load error:', e);
          }
        }
      } else {
        // Synth track
        if (this.scWidget) {
          try { this.scWidget.pause(); } catch (e) {}
        }
        if (!this.isPlaying) {
          this.play();
        } else {
          this.stepIndex = 0;
          this.startMusicLoop();
        }
      }
    }
  }

  async loadSoundCloudUrl(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) return null;
    const url = rawUrl.trim();

    // 1. Detect track ID from personalized-tracks or standard URL with track ID
    const matchId = url.match(/(?:personalized-tracks::[^:]+:|tracks\/)(\d+)/);
    let scEmbedUrl = url;
    let trackTitle = 'SoundCloud Track';
    let trackArtist = 'SoundCloud';

    if (matchId && matchId[1]) {
      const trackId = matchId[1];
      scEmbedUrl = `https://api.soundcloud.com/tracks/${trackId}`;
    }

    // 2. Resolve metadata & track embed URL via oEmbed if available
    try {
      const cleanUrl = url.split('?')[0];
      const oembedRes = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(cleanUrl)}`);
      if (oembedRes.ok) {
        const oData = await oembedRes.json();
        if (oData.title) trackTitle = oData.title;
        if (oData.author_name) trackArtist = oData.author_name;
        if (oData.html) {
          const urlMatch = oData.html.match(/url=([^&]+)/);
          if (urlMatch && urlMatch[1]) {
            scEmbedUrl = decodeURIComponent(urlMatch[1]);
          }
        }
      }
    } catch (e) {
      console.warn('oEmbed resolve note:', e);
    }

    // 3. Create track object
    const newTrack = {
      id: 'sc-custom-' + Date.now(),
      type: 'soundcloud',
      title: trackTitle,
      artist: trackArtist,
      genre: 'SoundCloud Track',
      scUrl: scEmbedUrl,
      permalinkUrl: url,
      badge: 'SoundCloud',
      bpm: 105
    };

    // Prepend to playlist
    this.playlist.unshift(newTrack);
    this.selectTrack(0);
    return newTrack;
  }

  startMusicLoop() {
    this.stopSynth();

    const track = this.getCurrentTrack();
    const bpm = track.bpm || 100;
    const intervalMs = (60 / bpm / 2) * 1000;

    this.musicTimer = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      this.playMelodyStep(track);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }, intervalMs);
  }

  playMelodyStep(track) {
    if (!this.audioCtx || !this.masterGain) return;
    const t = this.audioCtx.currentTime;
    const melody = track.melody || [261.63, 329.63, 392.00];
    const chords = track.chords || [261.63, 329.63, 392.00];

    // Bass note
    if (this.stepIndex % 4 === 0) {
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = 'triangle';
      const rootFreq = chords[0] / 2;
      bassOsc.frequency.setValueAtTime(rootFreq, t);

      bassGain.gain.setValueAtTime(0.35, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.45);
    }

    // Melodic lead note
    const noteIdx = [0, 2, 4, 3, 5, 2, 1, 4, 0, 3, 2, 5, 1, 4, 3, 2][this.stepIndex];
    const freq = melody[noteIdx % melody.length];

    const leadOsc = this.audioCtx.createOscillator();
    const leadGain = this.audioCtx.createGain();
    leadOsc.type = 'sawtooth';
    leadOsc.frequency.setValueAtTime(freq, t);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);

    leadGain.gain.setValueAtTime(0.14, t);
    leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    leadOsc.connect(filter);
    filter.connect(leadGain);
    leadGain.connect(this.masterGain);
    leadOsc.start(t);
    leadOsc.stop(t + 0.32);

    // Hi-hat
    if (this.stepIndex % 2 === 1) {
      this.playHiHat(t);
    }
  }

  playHiHat(t) {
    const noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.04, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, t);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start(t);
  }
}
