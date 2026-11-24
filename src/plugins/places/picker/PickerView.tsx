import { loadPlaces } from '@/plugins/places/shared/server';
import { Picker } from './components/Picker';

export async function PickerView() {
  const { places, tags } = await loadPlaces();
  return <Picker places={places} tags={tags} />;
}
