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
/* eslint-env node, mocha */
import sinon from 'sinon';

import { expect } from '../../../test-helpers/expect-unit';
import { applyDateRangeQuery } from '../../../src/api/utils/filters';

describe('Filter helpers', () => {
  describe('applyDateRangeQuery', () => {
    const qb = {
      where: sinon.stub(),
    };

    afterEach(() => {
      qb.where.reset();
    });

    context('both operands are present', () => {
      it('calls where on qb', () => {
        applyDateRangeQuery(qb, {
          dateRange: '2017-09-30T22:00:00.000Z..2017-09-29T22:00:00.000Z'
        }, { field: 'some_field' });

        expect(qb.where, 'to have calls satisfying', () => {
          qb.where('some_field', '<=', new Date('2017-09-30T22:00:00.000Z'));
          qb.where('some_field', '>=', new Date('2017-09-29T22:00:00.000Z'));
        });
      });
    });

    context('left operand is not present', () => {
      it('calls where on qb', () => {
        applyDateRangeQuery(qb, {
          dateRange: '2017-09-30T22:00:00.000Z..'
        }, { field: 'some_field' });

        expect(qb.where, 'to have calls satisfying', () => {
          qb.where('some_field', '<=', new Date('2017-09-30T22:00:00.000Z'));
        });
      });
    });

    context('right operand is not present', () => {
      it('calls where on qb', () => {
        applyDateRangeQuery(qb, {
          dateRange: '..2017-09-29T22:00:00.000Z'
        }, { field: 'some_field' });

        expect(qb.where, 'to have calls satisfying', () => {
          qb.where('some_field', '>=', new Date('2017-09-29T22:00:00.000Z'));
        });
      });
    });
  });
});
