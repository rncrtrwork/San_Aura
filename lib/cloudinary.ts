import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

let configured = false;

function parseCloudinaryUrl(value: string | undefined): CloudinaryCredentials | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'cloudinary:' || !url.username || !url.password || !url.hostname) {
      return null;
    }

    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
    };
  } catch {
    return null;
  }
}

export function getCloudinaryCredentials(
  env: Record<string, string | undefined> = process.env,
): CloudinaryCredentials | null {
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  return parseCloudinaryUrl(env.CLOUDINARY_URL);
}

export function getCloudinary(): typeof cloudinary {
  if (configured) {
    return cloudinary;
  }

  const credentials = getCloudinaryCredentials();

  if (!credentials) {
    throw new Error('Cloudinary environment variables are not configured');
  }

  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  });
  configured = true;

  return cloudinary;
}
