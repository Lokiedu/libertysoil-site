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
import React from 'react';
import { connect } from 'react-redux';

import { defaultSelector } from '../selectors';
import Footer from '../components/footer';
import Header from '../components/header';


class RegistrationSuccess extends React.Component {

  render() {

    return (
      <div>
        <Header />
          <div className="page__body">
            <div className="area">
              <div>
                <div className="area__body layout-align_start">
      <div className="message">
        <div className="message__body">
          You are now successfully registered. We have sent you verification email. Please find instructions in your mail box.
        </div>
      </div>
                </div>
              </div>
            </div>
          </div>
        <Footer/>
      </div>
      );
  }
}

export default connect(defaultSelector)(RegistrationSuccess);
