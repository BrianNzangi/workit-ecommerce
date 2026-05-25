import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  ensureCsrfToken,
  getCookieValue,
  getSessionUrl,
} from "@/lib/auth/csrf";

const OPTIMIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const getAuthBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || window.location.origin;
  }

  return process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL?.trim() ||
    "";
};

const AUTH_BASE_PATH = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim() || "/api/auth";
const AUTH_SESSION_URL = getSessionUrl(AUTH_BASE_PATH, getAuthBaseUrl());

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
  const csrfToken = (await ensureCsrfToken(AUTH_SESSION_URL)) || getCookieValue(CSRF_COOKIE_NAME);

  const uploadViaAdminProxy = async () => {
    const formData = new FormData();
    formData.append("file", preparedFile, preparedFile.name);
    if (folder) {
      formData.append("folder", folder);
    }

    const fallbackHeaders = new Headers();
    if (csrfToken) {
      fallbackHeaders.set(CSRF_HEADER_NAME, csrfToken);
    }

    const response = await fetch("/api/admin/assets", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: fallbackHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to upload asset");
    }

    const asset = await response.json();

    return {
      asset,
      uploadedFile: preparedFile,
      optimized: preparedFile !== file,
    };
  };

  const headers = new Headers();
  if (csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }
  headers.set("Content-Type", "application/json");

  const presignResponse = await fetch("/api/admin/assets/presign", {
    method: "POST",
    body: JSON.stringify({
      filename: preparedFile.name,
      contentType: preparedFile.type,
    }),
    credentials: "include",
    headers,
  });

  if (!presignResponse.ok) {
    const error = await presignResponse.json().catch(() => null);
    throw new Error(error?.message || "Failed to get upload URL");
  }

  const { key, uploadUrl, publicUrl } = await presignResponse.json();

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: preparedFile,
      headers: {
        "Content-Type": preparedFile.type,
      },
    });
  } catch (error) {
    console.warn("Direct storage upload failed, falling back to admin proxy upload:", {
      error,
      uploadUrl,
      publicUrl,
    });
    return uploadViaAdminProxy();
  }

  if (!uploadResponse.ok) {
    console.warn("Direct storage upload returned a non-OK response, falling back to admin proxy upload:", {
      status: uploadResponse.status,
      uploadUrl,
      publicUrl,
    });
    return uploadViaAdminProxy();
  }

  const registerHeaders = new Headers();
  registerHeaders.set("Content-Type", "application/json");
  if (csrfToken) {
    registerHeaders.set(CSRF_HEADER_NAME, csrfToken);
  }

  const registerResponse = await fetch("/api/admin/assets/register", {
    method: "POST",
    body: JSON.stringify({
      key,
      filename: preparedFile.name,
      contentType: preparedFile.type,
      fileSize: preparedFile.size,
    }),
    credentials: "include",
    headers: registerHeaders,
  });

  if (!registerResponse.ok) {
    const error = await registerResponse.json().catch(() => null);
    throw new Error(error?.message || "Failed to register asset");
  }

  const asset = await registerResponse.json();

  return {
    asset,
    uploadedFile: preparedFile,
    optimized: preparedFile !== file,
  };
}
