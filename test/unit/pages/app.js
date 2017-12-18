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
/*eslint-env node, mocha */
import i from 'immutable';
import ReactShallowRenderer from 'react-test-renderer/shallow';

import { expect, React } from '../../../test-helpers/expect-unit';
import ga from '../../../src/external/react-google-analytics';
import { UnwrappedApp } from '../../../src/pages/app';


const props = {
  ui: i.fromJS({
    sidebarIsVisible: false
  })
};

const GAInitializer = ga.Initializer;

describe('App page', function () {
  it('SHOULD NOT render GA when process.env.GOOGLE_ANALYTICS_ID not set', function () {
    delete process.env.GOOGLE_ANALYTICS_ID;

    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedApp {...props}>
        <span>foo</span>
      </UnwrappedApp>
    );

    return expect(renderer, 'not to contain', <GAInitializer />);
  });

  it('SHOULD render GA when process.env.GOOGLE_ANALYTICS_ID is set', function () {
    process.env.GOOGLE_ANALYTICS_ID = 100;

    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedApp {...props}>
        <span>foo</span>
      </UnwrappedApp>
    );

    return expect(renderer, 'to contain', <GAInitializer />);
  });
});
