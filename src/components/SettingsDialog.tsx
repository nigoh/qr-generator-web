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
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <DialogTitle>QRコード設定</DialogTitle>
          </div>
          <DialogDescription>
            QRコードの詳細な設定を変更できます
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4 pb-[env(safe-area-inset-bottom,96px)]">
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

          <div className="pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full min-h-[44px]"
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
