const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.82;
const MAX_OUTPUT_SIZE = 5 * 1024 * 1024;

interface ConvertImageToWebpOptions {
  maxDimension?: number;
  quality?: number;
}

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("El navegador no pudo leer el formato de la imagen."));
    image.src = source;
  });

const canvasToWebp = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob || blob.type !== "image/webp") {
          reject(
            new Error("Este navegador no permite convertir imágenes a WebP.")
          );
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality
    );
  });

const webpFileName = (fileName: string) => {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim();
  return `${baseName || "imagen"}.webp`;
};

export const convertImageToWebp = async (
  file: File,
  options: ConvertImageToWebpOptions = {}
) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen válido.");
  }

  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const largestDimension = Math.max(image.naturalWidth, image.naturalHeight);

    if (!largestDimension) {
      throw new Error("No se pudieron obtener las dimensiones de la imagen.");
    }

    const scale = Math.min(1, maxDimension / largestDimension);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo preparar la conversión de la imagen.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    const webp = await canvasToWebp(canvas, quality);
    if (webp.size > MAX_OUTPUT_SIZE) {
      throw new Error(
        "La imagen convertida todavía supera el límite de 5 MB. Selecciona una imagen más pequeña."
      );
    }

    return new File([webp], webpFileName(file.name), {
      type: "image/webp",
      lastModified: Date.now()
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
};
