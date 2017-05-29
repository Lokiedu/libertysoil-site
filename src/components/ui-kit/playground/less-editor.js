import React from 'react';
import isEqual from 'lodash/isEqual';

/**
 * 1. Сохранение актуальной структуры вкладок
 * 2. Синхронизация текущих стилей с <style></style> с помощью react-helmet
 *   - при этом каждая вкладка (то есть файл, напр. button.js) сохраняется независимо
 *     не затирает результаты компиляции других файлов
 *     (для этого разумно делать анализ импортов и названия текущего файла
 *     после чего вставлять комментарии с их названиями)
 * 3. Сохранение текущего кода во всех вкладках[, если они были изменены]
 * 4. Использование less.js для компиляции LESS
 */
export default class LessEditor extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || !isEqual(nextState, this.state);
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}
