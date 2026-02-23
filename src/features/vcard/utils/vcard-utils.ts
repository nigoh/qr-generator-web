import type { VCardData } from '../types';

/**
 * VCardDataからvCard v3形式の文字列を生成する
 */
export const buildVCardString = (data: VCardData): string => {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // 氏名
  const fullName = [data.lastName, data.firstName].filter(Boolean).join(' ');
  if (fullName) {
    lines.push(`FN:${fullName}`);
    lines.push(`N:${data.lastName};${data.firstName};;;`);
  }

  // ふりがな (X-PHONETIC)
  const kanaLast = data.lastNameKana;
  const kanaFirst = data.firstNameKana;
  if (kanaLast || kanaFirst) {
    lines.push(`X-PHONETIC-LAST-NAME:${kanaLast}`);
    lines.push(`X-PHONETIC-FIRST-NAME:${kanaFirst}`);
  }

  // 会社名
  if (data.company) {
    lines.push(`ORG:${data.company}`);
  }

  // 役職
  if (data.title) {
    lines.push(`TITLE:${data.title}`);
  }

  // 電話番号
  if (data.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${data.phone}`);
  }

  // メールアドレス
  if (data.email) {
    lines.push(`EMAIL;TYPE=WORK,INTERNET:${data.email}`);
  }

  // URL
  if (data.url) {
    lines.push(`URL:${data.url}`);
  }

  // 住所 (ADR: pobox;ext;street;city;region;postal;country)
  if (data.address) {
    lines.push(`ADR;TYPE=WORK:;;${data.address};;;;`);
  }

  // メモ
  if (data.note) {
    lines.push(`NOTE:${data.note}`);
  }

  lines.push('END:VCARD');
  return lines.join('\n');
};

/**
 * VCardDataが1フィールド以上入力されているかを確認する
 */
export const isVCardFilled = (data: VCardData): boolean => {
  return Object.values(data).some((v) => v.trim() !== '');
};
