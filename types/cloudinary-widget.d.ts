type CloudinaryUploadInfo = {
  secure_url: string;
  public_id: string;
  original_filename: string;
  resource_type: string;
  format: string;
};

type CloudinaryUploadResult = {
  event: string;
  info?: CloudinaryUploadInfo;
};

type CloudinaryUploadWidget = {
  open(): void;
  close(): void;
  destroy(): void;
};

type CloudinaryUploadWidgetOptions = {
  cloudName: string;
  apiKey: string;
  uploadSignature(
    callback: (signature: string) => void,
    paramsToSign: Record<string, string | number | boolean>,
  ): void;
  folder: string;
  tags: string[];
  context: Record<string, string>;
  sources: string[];
  resourceType: 'auto';
  clientAllowedFormats: string[];
  maxFileSize: number;
  multiple: boolean;
};

type CloudinaryWidgetApi = {
  createUploadWidget(
    options: CloudinaryUploadWidgetOptions,
    callback: (error: object | null, result: CloudinaryUploadResult) => void,
  ): CloudinaryUploadWidget;
};

interface Window {
  cloudinary?: CloudinaryWidgetApi;
}
