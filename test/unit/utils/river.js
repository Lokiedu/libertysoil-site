/* eslint-env node, mocha */
/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import i from 'immutable';
import { range } from 'lodash';

import { default as extend } from '../../../src/utils/river/extend';
import { expect } from '../../../test-helpers/expect-unit';

describe('River utils', () => {
  describe('extendRiver(river, nextRiver)', () => {
    describe('If nextRiver argument is filled properly but river is not', () => {
      it('Returns nextRiver as immutable', () => {
        [
          [extend(undefined, { entries: [], offset: 0 }),
            'to equal',
            i.Map({ entries: i.List(), offset: 0 })],
          [extend(undefined, { entries: [1, 2], offset: 0 }),
            'to equal',
            i.Map({ entries: i.List([1, 2]), offset: 0 })],
          [extend(i.Map(), { entries: [1, 2], offset: 0 }),
            'to equal',
            i.Map({ entries: i.List([1, 2]), offset: 0 })],
          [extend(i.Map({ entries: i.List() }), { entries: [1, 2], offset: 0 }),
            'to equal',
            i.Map({ entries: i.List([1, 2]), offset: 0 })],
          [extend(i.Map({ offset: 3 }), { entries: [1, 2], offset: 0 }),
            'to equal',
            i.Map({ entries: i.List([1, 2]), offset: 0 })],
          [extend(i.Map({ offset: 3 }), { entries: [{ id: 1 }, { id: 2 }], offset: 0 }),
            'to equal',
            i.Map({
              entries: i.List([i.Map({ id: 1 }), i.Map({ id: 2 })]),
              offset: 0
            })],
        ].forEach(args => expect(...args));
      });
    });

    describe('If river argument is filled properly but nextRiver is not', () => {
      it('Returns existing river instance', () => {
        const river = i.Map({ entries: i.List(['a']), offset: 0 });
        expect(extend(river, undefined), 'to be', river);
        expect(extend(river, null), 'to be', river);
        expect(extend(river, {}), 'to be', river);
        expect(extend(river, { entries: [] }), 'to be', river);
        expect(extend(river, { entries: ['b'] }), 'to be', river);
        expect(extend(river, { entries: ['b'], offset: null }), 'to be', river);
        expect(extend(river, { offset: 0 }), 'to be', river);
        expect(extend(river, { offset: 0 }), 'to be', river);
        expect(extend(river, { entries: null, offset: 0 }), 'to be', river);
      });
    });

    describe('If river arguments are not filled properly', () => {
      it('Returns undefined', () => {
        expect(extend(undefined, undefined), 'to equal', undefined);
        expect(extend(i.Map(), {}), 'to equal', undefined);
        expect(
          extend(i.Map({ entries: i.List() }), { entries: [] }),
          'to equal',
          undefined
        );
        expect(
          extend(i.Map({ offset: 5 }), { offset: 0 }),
          'to equal',
          undefined
        );
      });
    });

    describe('If both arguments are filled', () => {
      const prevEntries = range(5, 15);
      const prevOffset = 5;
      const prevRiver = i.Map({
        entries: i.List(prevEntries),
        offset: prevOffset
      });

      describe('Concatenation', () => {
        describe('Front side', () => {
          const nextEntries = range(0, 5);
          const nextOffset = 0;
          const nextRiver = { entries: nextEntries, offset: nextOffset };
          const result = extend(prevRiver, nextRiver);

          it('Entries are changed correctly', () => {
            expect(
              result.get('entries'),
              'to equal',
              i.List(nextEntries.concat(prevEntries))
            );
          });

          it('Offset is changed correctly', () => {
            expect(result.get('offset'), 'to equal', nextOffset);
          });
        });

        describe('Back side', () => {
          const nextEntries = range(15, 21);
          const nextOffset = 15;
          const nextRiver = { entries: nextEntries, offset: nextOffset };
          const result = extend(prevRiver, nextRiver);

          it('Entries are changed correctly', () => {
            expect(
              result.get('entries'),
              'to equal',
              i.List(prevEntries.concat(nextEntries))
            );
          });

          it('Offset is not changed', () => {
            expect(result.get('offset'), 'to equal', prevOffset);
          });
        });
      });

      describe('Extension and reuse', () => {
        describe('Front side', () => {
          const nextEntries = range(0, 6).concat([5.5]);
          const nextOffset = 0;
          const nextRiver = { entries: nextEntries, offset: nextOffset };
          const result = extend(prevRiver, nextRiver);

          it('All existing river items are preserved', () => {
            expect(result.get('entries').includes(5.5), 'to be falsy');
          });

          it('Entries are extended till the equal element', () => {
            expect(
              result.get('entries').take(6).toJS(),
              'to equal',
              range(0, 6)
            );
          });

          it('Offset is changed correctly', () => {
            expect(result.get('offset'), 'to equal', nextRiver.offset);
          });
        });

        describe('Back side', () => {
          const nextEntries = [13, 13.5].concat(range(15, 21));
          const nextOffset = 13;
          const nextRiver = { entries: nextEntries, offset: nextOffset };
          const result = extend(prevRiver, nextRiver);

          it('All existing river items are preserved', () => {
            expect(result.get('entries').includes(13.5), 'to be falsy');
          });

          it('The end of existing river is extended', () => {
            expect(
              result.get('entries').takeLast(nextEntries.length).toJS(),
              'to equal',
              range(13, 21)
            );
          });

          it('Offset is not changed', () => {
            expect(result.get('offset'), 'to equal', prevOffset);
          });
        });

        describe('Both sides', () => {
          const nextEntries = range(0, 7).concat(range(7.1, 20));
          const nextOffset = 0;
          const nextRiver = { entries: nextEntries, offset: nextOffset };
          const result = extend(prevRiver, nextRiver);

          it('All existing river items are preserved', () => {
            expect(
              result.get('entries').skip(5).skipLast(5).toJS(),
              'to equal',
              range(5, 15)
            );
          });

          it('Both ends of existing river are extended', () => {
            expect(
              result.get('entries').take(5).toJS(),
              'to equal',
              range(0, 5)
            );
            expect(
              result.get('entries').takeLast(5).toJS(),
              'to equal',
              range(15.1, 20)
            );
          });

          it('Offset is changed correctly', () => {
            expect(result.get('offset'), 'to equal', nextOffset);
          });
        });
      });

      describe('Override', () => {
        describe('Gaps between the rivers', () => {
          describe('Front side', () => {
            const nextEntries = range(0, 3);
            const nextOffset = 0;
            const nextRiver = { entries: nextEntries, offset: nextOffset };
            const result = extend(prevRiver, nextRiver);

            it('Existing river\'s items are reset', () => {
              expect(result.get('entries').toJS(), 'not to contain', prevEntries);
            });

            it('River is formed with nextRiver.entries items', () => {
              expect(result.get('entries').toJS(), 'to equal', nextEntries);
            });

            it('Offset is changed correctly', () => {
              expect(result.get('offset'), 'to equal', nextOffset);
            });
          });

          describe('Back side', () => {
            const nextEntries = range(20, 23);
            const nextOffset = 20;
            const nextRiver = { entries: nextEntries, offset: nextOffset };
            const result = extend(prevRiver, nextRiver);

            it('Existing river\'s items are reset', () => {
              expect(result.get('entries').toJS(), 'not to contain', prevEntries);
            });

            it('River is formed with nextRiver.entries items', () => {
              expect(result.get('entries').toJS(), 'to equal', nextEntries);
            });

            it('Offset is changed correctly', () => {
              expect(result.get('offset'), 'to equal', nextOffset);
            });
          });
        });

        describe('No intersection', () => {
          describe('Front side', () => {
            const nextEntries = range(3.1, 8);
            const nextOffset = 3;
            const nextRiver = { entries: nextEntries, offset: nextOffset };
            const result = extend(prevRiver, nextRiver);

            it('Existing river\'s items are reset', () => {
              expect(result.get('entries').toJS(), 'not to contain', prevEntries);
            });

            it('River is formed with nextRiver.entries items', () => {
              expect(result.get('entries').toJS(), 'to equal', nextEntries);
            });

            it('Offset is changed correctly', () => {
              expect(result.get('offset'), 'to equal', nextOffset);
            });
          });

          describe('Head of the river', () => {
            const nextEntries = range(5.1, 10);
            const nextOffset = 5;
            const nextRiver = { entries: nextEntries, offset: nextOffset };
            const result = extend(prevRiver, nextRiver);

            it('Existing river\'s items are reset', () => {
              expect(result.get('entries').toJS(), 'not to contain', prevEntries);
            });

            it('River is formed with nextRiver.entries items', () => {
              expect(result.get('entries').toJS(), 'to equal', nextEntries);
            });

            it('Offset is changed correctly', () => {
              expect(result.get('offset'), 'to equal', nextOffset);
            });
          });

          describe('Back side', () => {
            const nextEntries = range(10.1, 15);
            const nextOffset = 10;
            const nextRiver = { entries: nextEntries, offset: nextOffset };
            const result = extend(prevRiver, nextRiver);

            it('Existing river\'s items are reset', () => {
              expect(result.get('entries').toJS(), 'not to contain', prevEntries);
            });

            it('River is formed with nextRiver.entries items', () => {
              expect(result.get('entries').toJS(), 'to equal', nextEntries);
            });

            it('Offset is changed correctly', () => {
              expect(result.get('offset'), 'to equal', nextOffset);
            });
          });
        });
      });
    });
  });
});
