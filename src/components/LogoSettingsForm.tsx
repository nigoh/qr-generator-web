import React, { useState } from 'react';
import { useQRStore } from '../store/qrStore';
import { FileUpload } from './ui/FileUpload';
import { Slider } from './ui';
import { Label } from './ui';
import { Button } from './ui';

export const LogoSettingsForm: React.FC = () => {
  const {
    logoFile,
    logoSettings,
    setLogoFile,
    updateLogoSettings,
  } = useQRStore();
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ロゴファイルが変更されたときの処理
  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ロゴアップロード */}
      <div>
        <FileUpload
          accept="image/*"
          onChange={handleLogoUpload}
          preview={logoPreview}
          label="ロゴ画像をアップロード"
        />
      </div>

      {/* ロゴプレビュー */}
      {logoPreview && (
        <div className="space-y-2">
          <Label>プレビュー</Label>
          <div className="flex justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <img
              src={logoPreview}
              alt="ロゴプレビュー"
              className="max-w-20 max-h-20 object-contain"
              style={{
                borderRadius: `${logoSettings.radius}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ロゴ設定（ロゴがある場合のみ表示） */}
      {logoFile && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          {/* ロゴサイズ */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>ロゴサイズ</Label>
              <span className="text-sm text-gray-500">{logoSettings.size}%</span>
            </div>
            <Slider
              value={[logoSettings.size]}
              onValueChange={(value) => updateLogoSettings({ size: value[0] })}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              QRコード全体に対するロゴの大きさの割合です。
              大きすぎると読み取りに支障が出る場合があります（推奨: 10-30%）。
            </p>
          </div>

          {/* ロゴパディング */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>ロゴ周りの余白</Label>
              <span className="text-sm text-gray-500">{logoSettings.padding}px</span>
            </div>
            <Slider
              value={[logoSettings.padding]}
              onValueChange={(value) => updateLogoSettings({ padding: value[0] })}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              ロゴの周囲の余白サイズです。適度な余白でロゴを際立たせることができます。
            </p>
          </div>

          {/* ロゴ角丸 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>角丸</Label>
              <span className="text-sm text-gray-500">{logoSettings.radius}%</span>
            </div>
            <Slider
              value={[logoSettings.radius]}
              onValueChange={(value) => updateLogoSettings({ radius: value[0] })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              ロゴの角の丸みを調整します。100%で完全な円形になります。
            </p>
          </div>

          {/* プリセット */}
          <div className="space-y-2">
            <Label>プリセット</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateLogoSettings({ size: 20, padding: 4, radius: 100 })
                }
              >
                円形 (S)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateLogoSettings({ size: 25, padding: 6, radius: 20 })
                }
              >
                角丸 (M)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateLogoSettings({ size: 30, padding: 8, radius: 0 })
                }
              >
                四角 (L)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateLogoSettings({ size: 15, padding: 2, radius: 50 })
                }
              >
                小さめ
              </Button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-xs font-medium text-yellow-800 mb-1">
              ⚠️ 注意事項
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• ロゴが大きすぎるとQRコードが読み取れなくなる場合があります</li>
              <li>• エラー訂正レベルを「H（高）」に設定することを推奨します</li>
              <li>• 透明背景のPNGファイルが最も美しく表示されます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
