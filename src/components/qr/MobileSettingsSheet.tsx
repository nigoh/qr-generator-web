import React from 'react';
import { FileText, Palette } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { UrlInput } from '@/components/forms/UrlInput';
import { BasicSettingsForm } from '@/components/BasicSettingsForm';
import { StyleSettingsForm } from '@/components/StyleSettingsForm';
import { Button } from '@/components/ui/button';

interface MobileSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileSettingsSheet: React.FC<MobileSettingsSheetProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="QRコード設定">
      <div className="px-4 py-3 space-y-3 pb-6">
        <CollapsibleSection
          title={
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              スタイル設定
            </div>
          }
          defaultOpen
        >
          <StyleSettingsForm />
        </CollapsibleSection>

        <CollapsibleSection
          title={
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              基本設定
            </div>
          }
        >
          <div className="space-y-4">
            <UrlInput />
            <BasicSettingsForm />
          </div>
        </CollapsibleSection>

        <div className="pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full min-h-[48px]"
          >
            設定を閉じる
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
