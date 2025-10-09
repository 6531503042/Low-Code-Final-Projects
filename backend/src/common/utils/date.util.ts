import { ConfigService } from '@nestjs/config';

export function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getDefaultTimezone(configService: ConfigService): string {
  return configService.get<string>('DEFAULT_TIMEZONE', 'Asia/Bangkok');
}
