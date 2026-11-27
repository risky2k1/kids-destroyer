import {
  formatClockInVietnam,
  isApprovedPlace,
  nowMinutesInVietnam,
} from '@/plugins/places/shared';
import { loadPlaces } from '@/plugins/places/shared/server';
import { Picker } from './components/Picker';

export async function PickerView() {
  const { places, tags } = await loadPlaces();
  const now = new Date();
  return (
    <Picker
      places={places.filter(isApprovedPlace)}
      tags={tags}
      initialNowMinute={nowMinutesInVietnam(now)}
      initialClock={formatClockInVietnam(now)}
    />
  );
}
