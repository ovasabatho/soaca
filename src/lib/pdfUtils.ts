import { jsPDF } from 'jspdf';

export interface PageImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

/**
 * Loads an image from a source URL and returns an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load page image for PDF compilation'));
    img.src = src;
  });
}

/**
 * Converts and merges multiple image files (JPG, PNG, WebP) into a single multi-page PDF File.
 * Preserves each page's aspect ratio and dimensions cleanly.
 */
export async function mergeImagesToPdf(
  imageFiles: File[],
  title: string = 'sheet_music',
  onProgress?: (progressPercent: number, statusMessage: string) => void
): Promise<File> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('No images provided for PDF compilation.');
  }

  const total = imageFiles.length;
  let pdf: jsPDF | null = null;

  for (let i = 0; i < total; i++) {
    const file = imageFiles[i];
    if (onProgress) {
      const pct = Math.round(((i + 0.2) / total) * 60);
      onProgress(pct, `Processing page ${i + 1} of ${total} (${file.name})...`);
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const img = await loadImage(objectUrl);
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 1130;

      // Determine orientation based on aspect ratio
      const orientation: 'p' | 'l' = width > height ? 'l' : 'p';

      // Set page dimensions in points matching the image dimensions
      if (i === 0) {
        pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [width, height],
          compress: true,
        });
      } else if (pdf) {
        pdf.addPage([width, height], orientation);
      }

      if (pdf) {
        // Draw onto a canvas for clean JPEG compression & orientation stabilization
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill white background for sheet music in case of transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const imgData = canvas.toDataURL('image/jpeg', 0.90);
          pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
        }
      }

      if (onProgress) {
        const pct = Math.round(((i + 1) / total) * 60);
        onProgress(pct, `Compiled page ${i + 1} of ${total}...`);
      }
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  if (!pdf) {
    throw new Error('Failed to generate PDF from selected score pages.');
  }

  if (onProgress) {
    onProgress(65, 'Finalizing multi-page PDF document...');
  }

  const pdfBlob = pdf.output('blob');
  const safeTitle = (title || 'sheet_music')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const fileName = `${safeTitle || 'sheet_music'}.pdf`;

  return new File([pdfBlob], fileName, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}

/**
 * Natural sort helper for file names like 'page1.jpg', 'page2.jpg', 'page10.jpg'
 */
export function naturalSortFileNames<T extends { name: string }>(items: T[]): T[] {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return [...items].sort((a, b) => collator.compare(a.name, b.name));
}
