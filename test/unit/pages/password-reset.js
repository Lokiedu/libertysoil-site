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

import { PasswordResetPage, ResetForm, SuccessMessage } from '../../../src/pages/password-reset';


describe('PasswordResetPage', function () {
  // before(() => {
  //   sinon.stub(console, 'error').callsFake((warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });


  it('MUST renders <ResetForm /> by default', function () {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <PasswordResetPage is_logged_in={false} ui={i.Map()} />
    );

    return expect(renderer, 'to contain', <ResetForm />);
  });

  it('MUST contain <SuccessMessage /> when ui.submitResetPassword is true', function () {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <PasswordResetPage ui={i.fromJS({ submitResetPassword: true })} is_logged_in={false} />
    );

    return expect(renderer, 'to contain', <SuccessMessage />);
  });
});
