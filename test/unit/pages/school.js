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
import { TestUtils, expect, React, PropTypes } from '../../../test-helpers/expect-unit';

import { SchoolPage } from '../../../src/pages/school';
import SchoolHeader from '../../../src/components/school-header';
import NotFound from '../../../src/pages/not-found';


describe('School page', function() {

  it('MUST renders <Script /> if school not yet loaded', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<SchoolPage params={{school_name: 'test'}} school_posts={{}} />);

    return expect(renderer, 'to have rendered', <script />);
  });

  it('MUST renders <NotFound /> if no school found', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<SchoolPage params={{school_name: 'test'}} schools={[{url_name: 'test'}]} school_posts={{}} />);

    return expect(renderer, 'to have rendered', <NotFound />);
  });

  it('MUST renders default school description if no description provided', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<SchoolHeader school={{url_name: 'test', id: "1", name: "test"}} />);

    return expect(renderer, 'to contain', "No information provided...");
  });

  it('MUST renders school description', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<SchoolHeader school={{url_name: 'test', id: "1", description: 'test description'}} />);

    return expect(renderer, 'to contain', "test description");
  });

});
