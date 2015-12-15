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
import request from 'superagent';

export default class ApiClient
{
  host;
  serverReq = null;

  constructor(host, serverReq=null) {
    this.host = host;
    this.serverReq = serverReq;
  }

  apiUrl(relativeUrl) {
    return `${this.host}${relativeUrl}`;
  }

  async get(relativeUrl) {
    let req = request.get(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    return Promise.resolve(req);
  }

  async del(relativeUrl) {
    let req = request.del(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    return Promise.resolve(req);
  }

  async post(relativeUrl, data=null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.type('form').send(data);
    }

    return Promise.resolve(req);
  }

  async postJSON(relativeUrl, data=null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.send(data);
    }

    return Promise.resolve(req);
  }

  async subscriptions() {
    let response = await this.get('/api/v1/posts');
    return response.body;
  }

  async userInfo(username) {
    let response = await this.get(`/api/v1/user/${username}`);
    return response.body;
  }

  async schoolInfo(school_name) {
    let response = await this.get(`/api/v1/school/${school_name}`)
    return response.body;
  }

  async schools() {
    let response = await this.get('/api/v1/schools');
    return response.body;
  }

  async userPosts(username) {
    let response = await this.get(`/api/v1/posts/user/${username}`);
    return response.body;
  }

  async userTags(username) {
    let response = await this.get(`/api/v1/user/tags`);
    return response.body;
  }

  async userLikedPosts(username) {
    let response = await this.get(`/api/v1/posts/liked`)
    return response.body;
  }

  async schoolPosts(schoolUrlName) {
    let response = await this.get(`/api/v1/posts/school/${schoolUrlName}`);
    return response.body;
  }

  async getLikedPosts(username) {
    let response = await this.get(`/api/v1/posts/liked/${username}`)
    return response.body;
  }

  async userFavouredPosts(username) {
    let response = await this.get(`/api/v1/posts/favoured`)
    return response.body;
  }

  async getFavouredPosts(username) {
    let response = await this.get(`/api/v1/posts/favoured/${username}`)
    return response.body;
  }

  async tagPosts(tag) {
    let response = await this.get(`/api/v1/posts/tag/${tag}`);
    return response.body;
  }

  async city(city_id) {
    let response = await this.get(`/api/v1/city/${city_id}`);
    return response.body;
  }

  async country(country_code) {
    let response = await this.get(`/api/v1/country/${country_code}`);
    return response.body;
  }

  async cityPosts(city) {
    let response = await this.get(`/api/v1/city/${city}/posts`);
    return response.body;
  }

  async countryPosts(country) {
    let response = await this.get(`/api/v1/country/${country}/posts`);
    return response.body;
  }

  async like(postId) {
    let response = await this.post(`/api/v1/post/${postId}/like`);
    return response.body;
  }

  async unlike(postId) {
    let response = await this.post(`/api/v1/post/${postId}/unlike`);
    return response.body;
  }

  async fav(postId) {
    let response = await this.post(`/api/v1/post/${postId}/fav`);
    return response.body;
  }

  async unfav(postId) {
    let response = await this.post(`/api/v1/post/${postId}/unfav`);
    return response.body;
  }

  async follow(userName) {
    let response = await this.post(`/api/v1/user/${userName}/follow`);
    return response.body;
  }

  async updateUser(user) {
    let response = await this.postJSON(`/api/v1/user`, user);
    return response.body;
  }

  async changePassword(old_password, new_password) {
    let response = await this.postJSON(`/api/v1/user/password`, {old_password, new_password});
    return response.body;
  }

  async resetPassword(email) {
    let response = await this.postJSON(`/api/v1/resetpassword`, {email});

    return response.body;
  }

  async newPassword(hash, password, password_repeat) {
    let response = await this.postJSON(`/api/v1/newpassword/${hash}`, {password, password_repeat});
    return response.body;
  }

  async unfollow(userName) {
    let response = await this.post(`/api/v1/user/${userName}/unfollow`);
    return response.body;
  }

  async registerUser(userData) {
    let response = await this.post(`/api/v1/users`, userData);
    return response.body;
  }

  async login(loginData) {
    let response = await this.post(`/api/v1/session`, loginData);
    return response.body;
  }

  async userSuggestions() {
    let response = await this.get(`/api/v1/suggestions/personalized`);
    return response.body;
  }

  async initialSuggestions() {
    let response = await this.get(`/api/v1/suggestions/initial`);
    return response.body;
  }

  async postInfo(uuid) {
    let response = await this.get(`/api/v1/post/${uuid}`);
    return response.body;
  }

  async createPost(type, data) {
    data.type = type;
    let response = await this.postJSON(`/api/v1/posts`, data);
    return response.body;
  }

  async updatePost(uuid, data) {
    let response = await this.postJSON(`/api/v1/post/${uuid}`, data);
    return response.body;
  }

  async deletePost(uuid) {
    let response = await this.del(`/api/v1/post/${uuid}`);
    return response.body;
  }

  async updateSchool(uuid, data) {
    let response = await this.postJSON(`/api/v1/school/${uuid}`, data);
    return response.body;
  }
}
