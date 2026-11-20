'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createServer } from '@/plugins/sword-x-staff/studio';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';

export function ServerForm({
  onCreated,
  onError,
}: {
  onCreated: (id: string) => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [serverName, setServerName] = useState('');
  const [openedOn, setOpenedOn] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Input
          value={serverName}
          onChange={(event) => setServerName(event.target.value)}
          placeholder="Tên server"
        />
        <Input type="date" value={openedOn} onChange={(event) => setOpenedOn(event.target.value)} />
        <Button
          type="button"
          onClick={async () => {
            try {
              const id = await createServer(serverName, openedOn);
              onCreated(id);
              setServerName('');
              router.refresh();
            } catch (err) {
              onError(err instanceof Error ? err.message : 'Lỗi');
            }
          }}
        >
          Thêm server
        </Button>
      </CardContent>
    </Card>
  );
}
