const OPTIMIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function getOutputMimeType(inputType: string) {
  if (inputType === "image/png") return "image/png";
  if (inputType === "image/webp") return "image/webp";
  return "image/jpeg";
}

function replaceFileExtension(fileName: string, mimeType: string) {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return fileName.replace(/\.[^.]+$/, `.${extension}`);
}

function shouldOptimizeImage(file: File) {
  return OPTIMIZABLE_IMAGE_TYPES.has(file.type);
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export async function optimizeImageForUpload(file: File) {
  if (typeof window === "undefined" || !shouldOptimizeImage(file)) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const outputMimeType = getOutputMimeType(file.type);
    const blob = await canvasToBlob(
      canvas,
      outputMimeType,
      outputMimeType === "image/png" ? undefined : 0.92,
    );

    if (!blob) {
      return file;
    }

    const optimizedFile = new File(
      [blob],
      replaceFileExtension(file.name, outputMimeType),
      {
        type: outputMimeType,
        lastModified: file.lastModified,
      },
    );

    return optimizedFile.size < file.size ? optimizedFile : file;
  } catch (error) {
    console.error("Image optimization failed, using original file:", error);
    return file;
  }
}

export async function uploadAdminAsset({
  file,
  folder,
}: {
  file: File;
  folder?: string;
}) {
  const preparedFile = await optimizeImageForUpload(file);
  const formData = new FormData();

  formData.append("file", preparedFile, preparedFile.name);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch("/api/admin/assets", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Upload failed");
  }

  const asset = await response.json();

  return {
    asset,
    uploadedFile: preparedFile,
    optimized: preparedFile !== file,
  };
}
