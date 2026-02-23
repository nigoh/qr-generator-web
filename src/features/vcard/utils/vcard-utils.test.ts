import { describe, it, expect } from 'vitest';
import { buildVCardString, isVCardFilled } from './vcard-utils';
import type { VCardData } from '../types';
import { VCARD_INITIAL } from '../types';

const fullData: VCardData = {
  lastName: '山田',
  firstName: '太郎',
  lastNameKana: 'やまだ',
  firstNameKana: 'たろう',
  company: '株式会社サンプル',
  title: 'エンジニア',
  phone: '090-1234-5678',
  email: 'taro@example.com',
  url: 'https://example.com',
  address: '東京都渋谷区1-2-3',
  note: 'メモ',
};

describe('buildVCardString', () => {
  it('BEGIN/END:VCARDを含む', () => {
    const result = buildVCardString(fullData);
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('END:VCARD');
    expect(result).toContain('VERSION:3.0');
  });

  it('FNとNフィールドが正しく生成される', () => {
    const result = buildVCardString(fullData);
    expect(result).toContain('FN:山田 太郎');
    expect(result).toContain('N:山田;太郎;;;');
  });

  it('ふりがなフィールドが含まれる', () => {
    const result = buildVCardString(fullData);
    expect(result).toContain('X-PHONETIC-LAST-NAME:やまだ');
    expect(result).toContain('X-PHONETIC-FIRST-NAME:たろう');
  });

  it('会社名・役職が含まれる', () => {
    const result = buildVCardString(fullData);
    expect(result).toContain('ORG:株式会社サンプル');
    expect(result).toContain('TITLE:エンジニア');
  });

  it('電話・メール・URLが含まれる', () => {
    const result = buildVCardString(fullData);
    expect(result).toContain('TEL;TYPE=WORK,VOICE:090-1234-5678');
    expect(result).toContain('EMAIL;TYPE=WORK,INTERNET:taro@example.com');
    expect(result).toContain('URL:https://example.com');
  });

  it('空フィールドは省略される', () => {
    const sparse: VCardData = { ...VCARD_INITIAL, firstName: '花子' };
    const result = buildVCardString(sparse);
    expect(result).not.toContain('ORG:');
    expect(result).not.toContain('TEL');
    expect(result).toContain('FN:花子');
  });
});

describe('isVCardFilled', () => {
  it('全フィールドが空ならfalse', () => {
    expect(isVCardFilled(VCARD_INITIAL)).toBe(false);
  });

  it('1フィールドでも入力があればtrue', () => {
    expect(isVCardFilled({ ...VCARD_INITIAL, firstName: '太郎' })).toBe(true);
  });
});
