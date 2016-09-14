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
import { TestUtils, expect, React } from '../../../test-helpers/expect-unit';
import Helmet from 'react-helmet';
import sinon from 'sinon';

import { Auth } from '../../../src/pages/auth';
import Messages from '../../../src/components/messages';
import Header from '../../../src/components/header';
import HeaderLogo from '../../../src/components/header-logo';
import Login from '../../../src/components/login';
import Footer from '../../../src/components/footer';
import Register from '../../../src/components/register';


describe('Auth page with redux', function() {
  before(() => {
    sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  });

  after(() => {
    console.error.restore();
  });


  it('MUST render important components', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Auth is_logged_in messages={[]} ui={{}} />);

    return expect(
      renderer,
      'to have rendered',
      <div>
      </div>
    );
  });

  it('MUST render passed messages', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Auth is_logged_in messages={[{ message: 'Im foo message' }]} ui={{}} />);

    return expect(
      renderer,
      'to contain',
      <div>
        <Messages messages={[{message: 'Im foo message'}]} />
      </div>
    );
  });

  it('MUST pass ui.registrationSuccess to Register component', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Auth is_logged_in messages={[]} ui={{ registrationSuccess: false }} />);

    return expect(
      renderer,
      'to have rendered',
      <div>
        <Register registration_success={false} />
      </div>
    );
  });

});
