import { AVATARS } from '../lib/avatars';

/** Radio grid of emoji avatars; posts `avatar`. */
export function AvatarPicker({
  defaultValue,
  idPrefix,
}: {
  defaultValue?: string;
  idPrefix: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="mb-1 text-sm font-bold">Avatar</legend>
      {AVATARS.map((a) => (
        <label key={a} className="cursor-pointer">
          <input
            type="radio"
            name="avatar"
            value={a}
            id={`${idPrefix}-${a}`}
            defaultChecked={a === defaultValue}
            className="peer sr-only"
            required
          />
          <span className="rounded-base border-border bg-secondary-background peer-checked:bg-main peer-focus-visible:ring-2 flex size-11 items-center justify-center border-2 text-2xl">
            {a}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
