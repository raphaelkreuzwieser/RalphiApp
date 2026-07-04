import { createClient } from "@/lib/supabase/client";

const BUCKET = "videos";

export interface ResumableUploadHandle {
  abort: () => void;
}

/**
 * TUS resumable Upload direkt vom Client in den privaten Storage-Bucket 'videos'.
 * Fortschritt via onProgress; abbrechbar und (bei erneutem Start) wiederaufnehmbar.
 * Erst NACH onSuccess wird die Submission angelegt – ein Abbruch lässt also keine
 * verwaiste Submission zurück.
 */
export async function startResumableUpload({
  file,
  objectName,
  onProgress,
  onSuccess,
  onError,
}: {
  file: File;
  objectName: string;
  onProgress: (percent: number) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}): Promise<ResumableUploadHandle> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    onError("Nicht angemeldet – bitte neu einloggen.");
    return { abort: () => {} };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // tus-js-client erst bei Bedarf laden (hält das Race-Bundle klein).
  const tus = await import("tus-js-client");

  const upload = new tus.Upload(file, {
    endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      authorization: `Bearer ${session.access_token}`,
      "x-upsert": "true",
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: BUCKET,
      objectName,
      contentType: file.type || "video/mp4",
      cacheControl: "3600",
    },
    chunkSize: 6 * 1024 * 1024, // Supabase verlangt 6-MB-Chunks
    onError: (error) => onError(error.message || "Upload fehlgeschlagen."),
    onProgress: (sent, total) => onProgress(total ? Math.round((sent / total) * 100) : 0),
    onSuccess: () => onSuccess(),
  });

  // Falls es einen abgebrochenen Upload derselben Datei gibt: fortsetzen.
  const previous = await upload.findPreviousUploads();
  if (previous.length > 0) {
    upload.resumeFromPreviousUpload(previous[0]);
  }
  upload.start();

  return { abort: () => upload.abort(true).catch(() => {}) };
}
