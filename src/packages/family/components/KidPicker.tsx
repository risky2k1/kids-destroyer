'use client';

import { useRef, useState } from 'react';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { enterKidMode } from '../kidActions';

type Kid = { id: string; display_name: string; avatar: string };
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function PinPad({ kid, onBack }: { kid: Kid; onBack: () => void }) {
  const [pin, setPin] = useState('');
  const [state, formAction, pending] = useActionToast(enterKidMode);
  const formRef = useRef<HTMLFormElement>(null);

  function press(key: string) {
    if (key === '⌫') return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      // let React commit the hidden input value before submitting
      setTimeout(() => {
        formRef.current?.requestSubmit();
        setPin('');
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
      <span className="text-7xl">{kid.avatar}</span>
      <p className="text-2xl font-bold">{kid.display_name} ơi, nhập PIN nào!</p>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="kidId" value={kid.id} />
        <input type="hidden" name="pin" value={pin} />
      </form>
      <div className="flex gap-3" aria-label="PIN đã nhập">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`border-border size-6 rounded-full border-2 ${i < pin.length ? 'bg-main' : 'bg-secondary-background'}`}
          />
        ))}
      </div>
      {state.error && (
        <p role="alert" className="text-lg font-bold">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k ? (
            <Button
              key={i}
              type="button"
              variant="neutral"
              disabled={pending}
              onClick={() => press(k)}
              aria-label={k === '⌫' ? 'Xóa' : k}
              className="size-16 text-2xl"
            >
              {k}
            </Button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
      <Button type="button" variant="neutral" onClick={onBack}>
        ← Chọn bé khác
      </Button>
    </div>
  );
}

export function KidPicker({ kids }: { kids: Kid[] }) {
  const [kid, setKid] = useState<Kid | null>(null);
  if (kid) return <PinPad key={kid.id} kid={kid} onBack={() => setKid(null)} />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {kids.map((k) => (
        <button
          key={k.id}
          type="button"
          onClick={() => setKid(k)}
          className="rounded-base border-border bg-secondary-background shadow-shadow flex min-h-32 flex-col items-center justify-center gap-2 border-2 p-4 text-xl font-bold"
        >
          <span className="text-6xl">{k.avatar}</span>
          {k.display_name}
        </button>
      ))}
    </div>
  );
}
