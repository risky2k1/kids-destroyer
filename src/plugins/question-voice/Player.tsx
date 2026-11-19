'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/themes/neobrutal/ui/button';
import { uploadVoice } from './actions';
import type { VoiceContent, VoiceResponse } from './schema';

const CANDIDATE_MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'] as const;

function getSupportedMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return CANDIDATE_MIMES.find((mime) => MediaRecorder.isTypeSupported(mime));
}

export function Player({
  content,
  value,
  onChange,
  disabled,
}: {
  content: VoiceContent;
  value: VoiceResponse | undefined;
  onChange: (response: VoiceResponse) => void;
  disabled?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(content.maxSeconds ?? 60);
  const [isUploading, setIsUploading] = useState(false);
  const [micError, setMicError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isReRecording, setIsReRecording] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const mimeRef = useRef<string>('audio/webm');

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  async function startRecording() {
    if (disabled) return;
    setMicError(false);
    setUploadError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError(true);
      return;
    }

    const mime = getSupportedMime();
    if (!mime) {
      setMicError(true);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError(true);
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    mimeRef.current = mime;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: mime,
        audioBitsPerSecond: 32000,
      });
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMicError(true);
      return;
    }

    recorderRef.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const recordedMime = mimeRef.current || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: recordedMime });
      chunksRef.current = [];

      const localUrl = URL.createObjectURL(blob);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = localUrl;
      setPreviewUrl(localUrl);

      setIsUploading(true);
      try {
        const ext = recordedMime.includes('mp4')
          ? 'mp4'
          : recordedMime.includes('ogg')
            ? 'ogg'
            : 'webm';
        const fd = new FormData();
        fd.append('audio', blob, `recording.${ext}`);
        const res = await uploadVoice(fd);
        if (res.ok) {
          onChange({ path: res.path });
          setIsReRecording(false);
        } else {
          setUploadError(res.error);
        }
      } catch {
        setUploadError('Không lưu được bản ghi âm');
      } finally {
        setIsUploading(false);
      }
    };

    const maxSec = content.maxSeconds ?? 60;
    setSecondsLeft(maxSec);
    setIsRecording(true);

    recorder.start();

    let remaining = maxSec;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        stopRecording();
      }
    }, 1000);
  }

  function handleReRecord() {
    if (disabled) return;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setUploadError(null);
    setIsReRecording(true);
  }

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-lg font-bold text-foreground">
        Đang lưu...
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="text-xl font-bold text-foreground">
          Còn lại:{' '}
          <span className="rounded-base border-2 border-border bg-main px-2 py-0.5 text-main-foreground">
            {secondsLeft}s
          </span>
        </div>
        <Button
          variant="default"
          disabled={disabled}
          className="h-16 min-h-[44px] px-8 text-xl"
          onClick={stopRecording}
        >
          ⏹ Dừng
        </Button>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <audio controls src={previewUrl} className="w-full max-w-md">
          Trình duyệt không hỗ trợ phát âm thanh.
        </audio>
        <Button
          variant="neutral"
          disabled={disabled}
          className="h-12 min-h-[44px] px-6 text-lg"
          onClick={handleReRecord}
        >
          Thu lại
        </Button>
      </div>
    );
  }

  if (value?.path && !isReRecording) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <span className="text-xl font-bold text-foreground">Đã thu âm ✅</span>
        <Button
          variant="neutral"
          disabled={disabled}
          className="h-12 min-h-[44px] px-6 text-lg"
          onClick={handleReRecord}
        >
          Thu lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {micError ? (
        <p className="text-lg font-medium text-destructive">
          Không dùng được micro. Nhờ bố mẹ kiểm tra quyền micro nhé.
        </p>
      ) : null}
      {uploadError ? <p className="text-lg font-medium text-destructive">{uploadError}</p> : null}
      <Button
        variant="default"
        disabled={disabled}
        className="h-16 min-h-[44px] px-8 text-xl"
        onClick={startRecording}
      >
        🎙️ Bắt đầu thu
      </Button>
    </div>
  );
}
