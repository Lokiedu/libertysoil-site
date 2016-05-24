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
import kueLib from 'kue';

import config from '../../config';


let instance = null;

export default class Queue {

  constructor() {
    if (!instance) {
      instance = this;
      this.handler = kueLib.createQueue(config.kue);
    }

    return instance;
  }

  /**
   * Creates job in a queue
   */
  createJob = async (name, data) => {
    const promise = new Promise((resolve, reject) => {
      this.handler.create(name, data).save(function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return await promise;
  };

}
