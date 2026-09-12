/**
 * On phones with Web Share API support (iOS Safari 15+, Android Chrome), hands the
 * image to the native share sheet so the user can pick Instagram directly and post it
 * as a Story, instead of always saving to the gallery first. Falls back to a normal
 * download on desktop or browsers without file-sharing support.
 */
export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareTitle: string
): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: shareTitle });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Real failure (not a user cancel) - fall through to the download fallback below.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
