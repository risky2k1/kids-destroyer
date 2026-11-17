/** Result shape for every server action used with useActionState. */
export type ActionState = { ok: boolean; error?: string };
export const initialActionState: ActionState = { ok: false };
