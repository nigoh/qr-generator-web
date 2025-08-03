import React, { useEffect, useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { FileUpload } from '../ui/FileUpload';
import { Slider } from '../ui';
import { Label } from '../ui';

export const LogoUpload: React.FC = () => {
  const { logoFile, setLogoFile, logoSettings, updateLogoSettings } =
    useQRStore();

  const [preview, setPreview] = useState<string | null>(null);

  // ロゴファイルが変更されたときにプレビューを更新
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [logoFile]);

  const handleFileSelect = (file: File | null) => {
    setLogoFile(file);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">ロゴ設定</h3>

      {/* ファイルアップロード */}
      <FileUpload
        label="ロゴ画像"
        accept="image/*"
        onChange={handleFileSelect}
        preview={preview}
      />

      {/* ロゴ設定（ロゴがある場合のみ表示） */}
      {logoFile && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* ロゴサイズ */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>ロゴサイズ</Label>
              <span className="text-sm text-gray-500">{logoSettings.size}%</span>
            </div>
            <Slider
              value={[logoSettings.size]}
              onValueChange={(value) => updateLogoSettings({ size: value[0] })}
              min={10}
              max={40}
              step={1}
              className="w-full"
            />
          </div>

          {/* パディング */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>パディング</Label>
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
          </div>

          {/* 角丸 */}
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
          </div>

          {/* プリセット */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">
              プリセット
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  updateLogoSettings({ size: 20, padding: 4, radius: 100 })
                }
                className="px-3 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                🔵 円形・小
              </button>
              <button
                onClick={() =>
                  updateLogoSettings({ size: 30, padding: 6, radius: 100 })
                }
                className="px-3 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                🔵 円形・大
              </button>
              <button
                onClick={() =>
                  updateLogoSettings({ size: 20, padding: 4, radius: 20 })
                }
                className="px-3 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                ◻️ 角丸・小
              </button>
              <button
                onClick={() =>
                  updateLogoSettings({ size: 30, padding: 6, radius: 0 })
                }
                className="px-3 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                ⬛ 四角・大
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-xs font-medium text-yellow-800 mb-1">
          ⚠️ 重要な注意点
        </h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• ロゴサイズが大きすぎるとQRコードが読み取れなくなります</li>
          <li>• エラー訂正レベルをH（高）に設定することを強く推奨します</li>
          <li>• 生成後は必ず実際のQRリーダーでテストしてください</li>
          <li>• 印刷時は十分なサイズ（最低2cm×2cm）で出力してください</li>
        </ul>
      </div>
    </div>
  );
};
