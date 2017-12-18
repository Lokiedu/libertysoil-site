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

import { UnwrappedAuth } from '../../../src/pages/auth';
import Messages from '../../../src/components/messages';
import Register from '../../../src/components/register';


describe('UnwrappedAuth page with redux', function () {
  // before(() => {
  //   sinon.stub(console, 'error').callsFake((warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });


  it('MUST render important components', () => {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedAuth
        is_logged_in
        messages={i.List()}
        ui={i.Map()}
      />
    );

    return expect(
      renderer,
      'to have rendered',
      <div />
    );
  });

  it('MUST render passed messages', () => {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedAuth
        is_logged_in
        messages={i.fromJS([{ message: 'Im foo message' }])}
        ui={i.Map()}
      />
    );

    return expect(
      renderer,
      'to contain',
      <div>
        <Messages messages={i.fromJS([{ message: 'Im foo message' }])} />
      </div>
    );
  });

  it('MUST pass ui.registrationSuccess to Register component', () => {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedAuth
        is_logged_in
        messages={i.List()}
        ui={i.fromJS({ registrationSuccess: false })}
      />
    );

    return expect(
      renderer,
      'to have rendered',
      <div>
        <Register registration_success={false} />
      </div>
    );
  });
});
