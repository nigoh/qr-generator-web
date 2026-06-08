import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CollapsibleSection } from './CollapsibleSection';

afterEach(cleanup);

describe('CollapsibleSection', () => {
  it('トリガーと連動する aria 属性を持つ', () => {
    render(
      <CollapsibleSection title="セクション">
        <p>本文</p>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button', { name: 'セクション' });
    expect(button.getAttribute('aria-expanded')).toBe('false');

    // aria-controls が指す要素が存在する
    const panelId = button.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId as string);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(button.id);
    // 閉じている間は hidden
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  it('クリックで開閉し aria-expanded が切り替わる', () => {
    render(
      <CollapsibleSection title="セクション">
        <p>本文</p>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button', { name: 'セクション' });
    const panel = document.getElementById(button.getAttribute('aria-controls') as string);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hasAttribute('hidden')).toBe(false);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  it('defaultOpen=true で初期状態が開いている', () => {
    render(
      <CollapsibleSection title="セクション" defaultOpen>
        <p>本文</p>
      </CollapsibleSection>
    );
    const button = screen.getByRole('button', { name: 'セクション' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
