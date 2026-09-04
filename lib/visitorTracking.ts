export type VisitorDeviceInfo = {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
};

export type VisitorLocationInfo = {
  country: string;
  region: string;
  city: string;
};

const unknownLabel = 'Unknown';

function matchVersion(userAgent: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = pattern.exec(userAgent);
    if (match?.[1]) return match[1].replaceAll('_', '.');
  }

  return '';
}

function cleanHeaderValue(value: string | null): string {
  if (!value) return unknownLabel;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unknown') return unknownLabel;

  try {
    return decodeURIComponent(trimmed.replaceAll('+', ' '));
  } catch {
    return trimmed;
  }
}

function firstHeaderValue(headers: Headers, names: string[]): string {
  for (const name of names) {
    const value = cleanHeaderValue(headers.get(name));
    if (value !== unknownLabel) return value;
  }

  return unknownLabel;
}

function parseBrowser(
  userAgent: string,
): Pick<VisitorDeviceInfo, 'browserName' | 'browserVersion'> {
  if (!userAgent.trim()) return { browserName: unknownLabel, browserVersion: '' };

  if (/SamsungBrowser\//i.test(userAgent)) {
    return {
      browserName: 'Samsung Internet',
      browserVersion: matchVersion(userAgent, [/SamsungBrowser\/([\d.]+)/i]),
    };
  }

  if (/Edg\//i.test(userAgent)) {
    return {
      browserName: 'Microsoft Edge',
      browserVersion: matchVersion(userAgent, [/Edg\/([\d.]+)/i]),
    };
  }

  if (/OPR\//i.test(userAgent)) {
    return {
      browserName: 'Opera',
      browserVersion: matchVersion(userAgent, [/OPR\/([\d.]+)/i]),
    };
  }

  if (/CriOS\//i.test(userAgent) || /Chrome\//i.test(userAgent)) {
    return {
      browserName: 'Chrome',
      browserVersion: matchVersion(userAgent, [/CriOS\/([\d.]+)/i, /Chrome\/([\d.]+)/i]),
    };
  }

  if (/FxiOS\//i.test(userAgent) || /Firefox\//i.test(userAgent)) {
    return {
      browserName: 'Firefox',
      browserVersion: matchVersion(userAgent, [/FxiOS\/([\d.]+)/i, /Firefox\/([\d.]+)/i]),
    };
  }

  if (/Safari\//i.test(userAgent)) {
    return {
      browserName: 'Safari',
      browserVersion: matchVersion(userAgent, [/Version\/([\d.]+)/i, /Safari\/([\d.]+)/i]),
    };
  }

  return { browserName: unknownLabel, browserVersion: '' };
}

function parseOperatingSystem(userAgent: string): string {
  if (!userAgent.trim()) return unknownLabel;

  if (/CrOS/i.test(userAgent)) {
    return `Chrome OS ${matchVersion(userAgent, [/CrOS [^ ]+ ([\d.]+)/i])}`.trim();
  }

  if (/Windows NT 10/i.test(userAgent)) return 'Windows 10/11';
  if (/Windows NT 6\.3/i.test(userAgent)) return 'Windows 8.1';
  if (/Windows NT 6\.2/i.test(userAgent)) return 'Windows 8';
  if (/Windows NT 6\.1/i.test(userAgent)) return 'Windows 7';
  if (/Windows/i.test(userAgent)) return 'Windows';

  if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
    return `iOS ${matchVersion(userAgent, [/OS ([\d_]+)/i])}`.trim();
  }

  if (/Android/i.test(userAgent)) {
    return `Android ${matchVersion(userAgent, [/Android ([\d.]+)/i])}`.trim();
  }

  if (/Mac OS X/i.test(userAgent)) {
    return `macOS ${matchVersion(userAgent, [/Mac OS X ([\d_]+)/i])}`.trim();
  }

  if (/Linux/i.test(userAgent)) return 'Linux';

  return unknownLabel;
}

function normalizeIpCandidate(value: string): string {
  const cleaned = cleanHeaderValue(value).replace(/^"|"$/g, '').trim();
  if (cleaned === unknownLabel) return unknownLabel;
  if (cleaned.startsWith('[')) return cleaned.slice(1).split(']')[0] || unknownLabel;
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(cleaned)) return cleaned.split(':')[0] ?? unknownLabel;
  return cleaned;
}

function forwardedForIp(value: string | null): string {
  if (!value) return unknownLabel;
  const forValue = value
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith('for='));
  if (!forValue) return unknownLabel;
  return normalizeIpCandidate(forValue.slice(4));
}

function headerListIp(value: string | null): string {
  if (!value) return unknownLabel;
  const firstValue = value.split(',')[0]?.trim();
  return firstValue ? normalizeIpCandidate(firstValue) : unknownLabel;
}

export function parseVisitorUserAgent(userAgent: string): VisitorDeviceInfo {
  const browser = parseBrowser(userAgent);

  return {
    ...browser,
    operatingSystem: parseOperatingSystem(userAgent),
  };
}

export function visitorLocationFromHeaders(headers: Headers): VisitorLocationInfo {
  return {
    country: firstHeaderValue(headers, [
      'x-vercel-ip-country',
      'cf-ipcountry',
      'x-geo-country',
      'x-country-code',
    ]),
    region: firstHeaderValue(headers, [
      'x-vercel-ip-country-region',
      'x-geo-region',
      'x-region',
      'x-region-code',
    ]),
    city: firstHeaderValue(headers, ['x-vercel-ip-city', 'x-geo-city', 'x-city']),
  };
}

export function visitorIpAddressFromHeaders(headers: Headers): string {
  const directIp = firstHeaderValue(headers, [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
    'x-client-ip',
  ]);
  if (directIp !== unknownLabel) return normalizeIpCandidate(directIp);

  const forwardedIp = headerListIp(headers.get('x-forwarded-for'));
  if (forwardedIp !== unknownLabel) return forwardedIp;

  return forwardedForIp(headers.get('forwarded'));
}

export function isAutomatedVisitor(userAgent: string): boolean {
  return /bot|crawler|spider|preview|validator|monitoring|uptime|lighthouse|pagespeed/i.test(
    userAgent,
  );
}
