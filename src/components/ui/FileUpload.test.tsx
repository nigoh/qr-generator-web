import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

/** 指定バイト数のダミーファイルを生成する */
function makeFile(name: string, sizeBytes: number): File {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

function selectFile(file: File): void {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  fireEvent.change(input, { target: { files: [file] } });
}

describe('FileUpload', () => {
  it('上限以下のファイルは onChange に渡される', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    render(
      <FileUpload
        label="ロゴ"
        accept="image/*"
        onChange={onChange}
        onError={onError}
        maxSizeBytes={5 * 1024 * 1024}
      />
    );

    const file = makeFile('small.png', 1024);
    selectFile(file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(onError).not.toHaveBeenCalled();
  });

  it('上限を超えるファイルは拒否し onError を呼ぶ', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    render(
      <FileUpload
        label="ロゴ"
        accept="image/*"
        onChange={onChange}
        onError={onError}
        maxSizeBytes={5 * 1024 * 1024}
      />
    );

    selectFile(makeFile('huge.png', 6 * 1024 * 1024));

    expect(onChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toContain('5MB');
  });

  it('maxSizeBytes 未指定なら従来どおりサイズ制限しない', () => {
    const onChange = vi.fn();
    render(<FileUpload label="ロゴ" accept="image/*" onChange={onChange} />);

    const file = makeFile('huge.png', 50 * 1024 * 1024);
    selectFile(file);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('上限表示がヘルプテキストに含まれる', () => {
    render(
      <FileUpload
        label="ロゴ"
        accept="image/*"
        onChange={vi.fn()}
        maxSizeBytes={5 * 1024 * 1024}
      />
    );
    expect(screen.getByText(/最大 5MB/)).toBeTruthy();
  });
});
