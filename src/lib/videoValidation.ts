/** Client-seitige Prüfung der Video-Datei vor dem Upload (Abschnitt 6.2). */

export const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_SECONDS = 60;
const ALLOWED_TYPES = ["video/mp4", "video/quicktime"];

/** Dauer eines Videos in Sekunden über die Metadaten (oder null, wenn unbekannt). */
export function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Number.isFinite(video.duration) ? video.duration : null);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      video.src = url;
    } catch {
      resolve(null);
    }
  });
}

/** Gibt eine Fehlermeldung zurück oder null, wenn die Datei ok ist. */
export async function validateVideoFile(file: File): Promise<string | null> {
  const type = file.type || "";
  const isMov = file.name.toLowerCase().endsWith(".mov");
  if (!ALLOWED_TYPES.includes(type) && !isMov) {
    return "Nur MP4 oder MOV erlaubt.";
  }
  if (file.size > MAX_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return `Video ist zu groß (${mb} MB). Maximal 100 MB – bitte kürzer/kleiner aufnehmen.`;
  }
  const duration = await getVideoDuration(file);
  if (duration !== null && duration > MAX_SECONDS + 0.5) {
    return `Video ist zu lang (${Math.round(duration)} s). Maximal 60 Sekunden.`;
  }
  return null;
}

/** Storage-Objektpfad: {user_id}/{uuid}.{ext} */
export function buildVideoPath(userId: string, file: File): string {
  const ext = file.name.toLowerCase().endsWith(".mov") ? "mov" : "mp4";
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${userId}/${uuid}.${ext}`;
}
