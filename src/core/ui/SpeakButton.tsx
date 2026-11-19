'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/themes/neobrutal/ui/button';

/** Reads `text` aloud with a device voice for `lang` ('vi' | 'en'); hidden when no such voice exists. */
export function SpeakButton({ text, lang }: { text: string; lang: string }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    // Voices load async on Chrome; Safari has them at once.
    const pick = () =>
      setVoice(synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang)) ?? null);
    pick();
    synth.addEventListener('voiceschanged', pick);
    return () => {
      synth.removeEventListener('voiceschanged', pick);
      synth.cancel();
    };
  }, [lang]);

  if (!voice) return null;

  function speak() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice!.lang;
    utterance.rate = 0.9;
    synth.speak(utterance);
  }

  return (
    <Button
      type="button"
      variant="neutral"
      size="icon"
      className="size-12 shrink-0 text-2xl"
      onClick={speak}
      aria-label="Đọc đề"
    >
      🔊
    </Button>
  );
}
