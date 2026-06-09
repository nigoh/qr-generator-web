import React from 'react';
import { FileText, Palette, Image, Settings, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { UrlInput } from './forms/UrlInput';
import { BasicSettingsForm } from './BasicSettingsForm';
import { StyleSettingsForm } from './StyleSettingsForm';
import { LogoSettingsForm } from './LogoSettingsForm';
import { Button } from './ui/button';
import { ResetButton } from './qr/ResetButton';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* DialogHeader は flex-row のため、タイトルと説明は縦積みのカラムでまとめる */}
          <div className="flex min-w-0 flex-col pr-8">
            <div className="flex min-w-0 items-center gap-2">
              <Settings className="h-5 w-5 shrink-0 text-gray-600" />
              <DialogTitle className="whitespace-nowrap">QRコード設定</DialogTitle>
            </div>
            <DialogDescription>
              QRコードの詳細な設定を変更できます
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4 pb-24">
          <CollapsibleSection
            title={
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                入力タイプ・プリセット
              </div>
            }
            defaultOpen
          >
            <UrlInput />
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                基本設定
              </div>
            }
            defaultOpen
            data-tour="basic-settings"
          >
            <BasicSettingsForm />
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                スタイル設定
              </div>
            }
            defaultOpen
            data-tour="style-settings"
          >
            <StyleSettingsForm />
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                ロゴ埋め込み
              </div>
            }
            data-tour="logo-settings"
          >
            <LogoSettingsForm />
          </CollapsibleSection>

          <div className="flex items-center gap-2 pt-4">
            <ResetButton variant="outline" size="default" className="min-h-[44px] shrink-0" />
            <Button
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] flex-1"
              size="default"
            >
              設定を閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
