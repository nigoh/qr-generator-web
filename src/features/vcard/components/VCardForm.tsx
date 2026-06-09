import React, { useEffect, useState } from 'react';
import { Input, Label, Textarea } from '@/components/ui';
import { buildVCardString, isVCardFilled } from '../utils/vcard-utils';
import type { VCardData } from '../types';
import { VCARD_INITIAL } from '../types';

/** vCardデータを通知用文字列へ変換する。1項目も入力が無ければ空文字を返し、
 *  空のQR（BEGIN:VCARD…END:VCARDだけ）が生成されるのを防ぐ。 */
const toVCardOutput = (data: VCardData): string =>
  isVCardFilled(data) ? buildVCardString(data) : '';

interface VCardFormProps {
  /** vCard文字列が変わるたびに呼ばれるコールバック */
  onChange: (vcard: string) => void;
}

export const VCardForm: React.FC<VCardFormProps> = ({ onChange }) => {
  const [data, setData] = useState<VCardData>(VCARD_INITIAL);

  const update = (field: keyof VCardData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData((prev) => {
      const next = { ...prev, [field]: e.target.value };
      onChange(toVCardOutput(next));
      return next;
    });
  };

  // 初回マウント時にも通知（未入力なら空文字＝QRは生成されない）
  useEffect(() => {
    onChange(toVCardOutput(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4" data-tour="vcard-form">
      {/* 氏名 */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-700">氏名</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vc-last">姓</Label>
            <Input
              id="vc-last"
              value={data.lastName}
              onChange={update('lastName')}
              placeholder="山田"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="vc-first">名</Label>
            <Input
              id="vc-first"
              value={data.firstName}
              onChange={update('firstName')}
              placeholder="太郎"
              maxLength={100}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vc-last-kana">姓（ふりがな）</Label>
            <Input
              id="vc-last-kana"
              value={data.lastNameKana}
              onChange={update('lastNameKana')}
              placeholder="やまだ"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="vc-first-kana">名（ふりがな）</Label>
            <Input
              id="vc-first-kana"
              value={data.firstNameKana}
              onChange={update('firstNameKana')}
              placeholder="たろう"
              maxLength={100}
            />
          </div>
        </div>
      </fieldset>

      {/* 会社・役職 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="vc-company">会社名</Label>
          <Input
            id="vc-company"
            value={data.company}
            onChange={update('company')}
            placeholder="株式会社サンプル"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="vc-title">役職</Label>
          <Input
            id="vc-title"
            value={data.title}
            onChange={update('title')}
            placeholder="エンジニア"
            maxLength={100}
          />
        </div>
      </div>

      {/* 電話・メール */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <Label htmlFor="vc-phone">電話番号</Label>
          <Input
            id="vc-phone"
            type="tel"
            value={data.phone}
            onChange={update('phone')}
            placeholder="090-1234-5678"
            maxLength={40}
          />
        </div>
        <div>
          <Label htmlFor="vc-email">メールアドレス</Label>
          <Input
            id="vc-email"
            type="email"
            value={data.email}
            onChange={update('email')}
            placeholder="taro@example.com"
            maxLength={100}
          />
        </div>
      </div>

      {/* URL */}
      <div>
        <Label htmlFor="vc-url">WebサイトURL</Label>
        <Input
          id="vc-url"
          type="url"
          value={data.url}
          onChange={update('url')}
          placeholder="https://example.com"
          maxLength={200}
        />
      </div>

      {/* 住所 */}
      <div>
        <Label htmlFor="vc-address">住所</Label>
        <Input
          id="vc-address"
          value={data.address}
          onChange={update('address')}
          placeholder="東京都渋谷区〇〇 1-2-3"
          maxLength={200}
        />
      </div>

      {/* メモ */}
      <div>
        <Label htmlFor="vc-note">メモ</Label>
        <Textarea
          id="vc-note"
          value={data.note}
          onChange={update('note')}
          placeholder="自由記入欄"
          rows={2}
          maxLength={500}
        />
      </div>

      <p className="text-xs text-gray-500">
        入力した情報はvCard v3形式でQRコードに埋め込まれます。スマートフォンで読み取ると連絡先として保存できます。
      </p>
    </div>
  );
};
