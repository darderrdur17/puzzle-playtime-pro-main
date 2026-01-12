import { useRef, useCallback } from "react";

const SOUND_URLS = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  wrong: "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3",
  combo: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  hint: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  complete: "https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3",
  doublePoints: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3",
  // Leaderboard reveal sounds
  countdown: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  drumroll: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
  reveal: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3",
  winner: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  applause: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3",
  timesup: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  // Drag and drop sounds
  pickup: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  drop: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
  snap: "https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3",
};

type SoundType = keyof typeof SOUND_URLS;

export const useAudioFeedback = () => {
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const isMuted = useRef(false);

  const getAudio = useCallback((type: SoundType): HTMLAudioElement => {
    if (!audioCache.current.has(type)) {
      const audio = new Audio(SOUND_URLS[type]);
      audio.volume = 0.5;
      audioCache.current.set(type, audio);
    }
    return audioCache.current.get(type)!;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted.current) return;
    
    try {
      const audio = getAudio(type);
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently fail if audio can't play (e.g., no user interaction yet)
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [getAudio]);

  const toggleMute = useCallback(() => {
    isMuted.current = !isMuted.current;
    return isMuted.current;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMuted.current = muted;
  }, []);

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioCache.current.get(type);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return {
    playSound,
    stopSound,
    toggleMute,
    setMuted,
    isMuted: () => isMuted.current,
  };
};
