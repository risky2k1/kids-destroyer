const IMAGE_FILE = /^[^/]+\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$/;

export function isImagePath(path: string): boolean {
  return IMAGE_FILE.test(path);
}

/** True when `path` is `<uid>/<uuid>.<ext>` and the extension is an allowed image. */
export function isOwnImagePath(path: string, uid: string): boolean {
  return isImagePath(path) && path.startsWith(`${uid}/`);
}
