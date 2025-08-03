/**
 * QRコード構造パターン判定ユーティリティ
 * Python版と同等の精度でQRコードの重要な構造を識別
 */

/**
 * 位置検出パターン（ファインダーパターン）の領域をチェック
 */
export const isFinderPattern = (row: number, col: number, size: number): boolean => {
  // 左上の位置検出パターン (0-6, 0-6) + 分離パターン含む (0-8, 0-8)
  if (row <= 8 && col <= 8) return true;
  
  // 右上の位置検出パターン (0-8, size-9 to size-1)
  if (row <= 8 && col >= size - 9) return true;
  
  // 左下の位置検出パターン (size-9 to size-1, 0-8)
  if (row >= size - 9 && col <= 8) return true;
  
  return false;
};

/**
 * タイミングパターンの領域をチェック
 */
export const isTimingPattern = (row: number, col: number, size: number): boolean => {
  // 水平タイミングパターン (row 6, columns 8 to size-9)
  if (row === 6 && col >= 8 && col <= size - 9) return true;
  
  // 垂直タイミングパターン (column 6, rows 8 to size-9)
  if (col === 6 && row >= 8 && row <= size - 9) return true;
  
  return false;
};

/**
 * ダークモジュール（バージョン情報の一部）をチェック
 */
export const isDarkModule = (row: number, col: number, size: number): boolean => {
  // QRコードVersion 1の場合、ダークモジュールは(4*version + 9, 8)の位置
  if (size === 21) { // Version 1
    if (row === 13 && col === 8) return true; // (4*1+9, 8)
  }
  return false;
};

/**
 * フォーマット情報領域をチェック
 */
export const isFormatInformation = (row: number, col: number, size: number): boolean => {
  // 左上のファインダーパターン周辺のフォーマット情報
  if ((row === 8 && col <= 8) || (col === 8 && row <= 8)) return true;
  
  // 右上と左下のフォーマット情報
  if (row === 8 && col >= size - 8) return true;
  if (col === 8 && row >= size - 7) return true;
  
  return false;
};

/**
 * バージョン情報領域をチェック（Version 7以上で使用）
 */
export const isVersionInformation = (row: number, col: number, size: number): boolean => {
  if (size >= 45) { // Version 7以上
    // 右上のバージョン情報 (0-5, size-11 to size-9)
    if (row <= 5 && col >= size - 11 && col <= size - 9) return true;
    
    // 左下のバージョン情報 (size-11 to size-9, 0-5)
    if (row >= size - 11 && row <= size - 9 && col <= 5) return true;
  }
  return false;
};

/**
 * アライメントパターンの領域をチェック
 */
export const isAlignmentPattern = (row: number, col: number, size: number): boolean => {
  // Version 1にはアライメントパターンはない
  if (size === 21) return false; // Version 1
  
  // Version 2以上のアライメントパターン位置を計算
  if (size >= 25) { // Version 2以上
    const alignmentPositions: number[] = [];
    
    if (size === 25) { // Version 2
      alignmentPositions.push(6, 18);
    } else if (size === 29) { // Version 3
      alignmentPositions.push(6, 22);
    } else if (size === 33) { // Version 4
      alignmentPositions.push(6, 26);
    } else {
      // その他のバージョンは中央付近にアライメントパターンがある
      const center = Math.floor(size / 2);
      alignmentPositions.push(center);
    }
    
    for (const centerRow of alignmentPositions) {
      for (const centerCol of alignmentPositions) {
        // ファインダーパターンと重複しない場合のみ
        if (!isFinderPattern(centerRow, centerCol, size)) {
          if (Math.abs(row - centerRow) <= 2 && Math.abs(col - centerCol) <= 2) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

/**
 * 重要な構造パターンかどうかをチェック
 * これらの領域は標準の四角形ドットを維持する必要がある
 */
export const isStructuralPattern = (row: number, col: number, size: number): boolean => {
  return (
    isFinderPattern(row, col, size) ||
    isTimingPattern(row, col, size) ||
    isFormatInformation(row, col, size) ||
    isVersionInformation(row, col, size) ||
    isAlignmentPattern(row, col, size) ||
    isDarkModule(row, col, size)
  );
};

/**
 * データ領域かどうかをチェック
 * カスタム形状を適用できる領域
 */
export const isDataArea = (row: number, col: number, size: number): boolean => {
  return !isStructuralPattern(row, col, size);
};
