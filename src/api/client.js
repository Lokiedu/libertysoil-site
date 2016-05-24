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
import fetch from 'isomorphic-fetch';
import { format as format_url, parse as parse_url } from 'url';
import { merge as mergeObj } from 'lodash';


export default class ApiClient
{
  host;
  serverReq = null;

  constructor(host, serverReq = null) {
    this.host = host;
    this.serverReq = serverReq;
  }

  apiUrl(relativeUrl) {
    return `${this.host}${relativeUrl}`;
  }

  apiUrlForFetch(relativeUrl, query = {}) {
    const urlObj = parse_url(this.apiUrl(relativeUrl));
    urlObj.query = mergeObj(urlObj.query, query);

    return format_url(urlObj);
  }

  async get(relativeUrl, query = {}) {
    let defaultHeaders = {};

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      defaultHeaders = { Cookie: this.serverReq.headers['cookie'] };
    }

    const req = fetch(
      this.apiUrlForFetch(relativeUrl, query),
      {
        headers: defaultHeaders,
        credentials: 'same-origin'
      }
    );

    return Promise.resolve(req);
  }

  async head(relativeUrl, query = {}) {
    let req = request
      .head(this.apiUrl(relativeUrl))
      .query(query);

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

  async post(relativeUrl, data = null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.type('form').send(data);
    }

    return Promise.resolve(req);
  }

  /*
    *post without setting content type
  */

  async postMultipart(relativeUrl, data = null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.send(data);
    }


    return Promise.resolve(req);
  }

  async postJSON(relativeUrl, data = null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.send(data);
    }

    return Promise.resolve(req);
  }

  async subscriptions(offset = 0) {
    const response = await this.get(`/api/v1/posts?offset=${offset}`);
    return await response.json();
  }

  async checkUserExists(username) {
    try {
      await this.head(`/api/v1/user/${username}`);
    } catch (e) {
      return false;
    }

    return true;
  }

  async checkEmailTaken(email) {
    try {
      await this.head(`/api/v1/user/email/${email}`);
    } catch (e) {
      return false;
    }

    return true;
  }

  async getAvailableUsername(username) {
    const response = await this.get(`/api/v1/user/available-username/${username}`);
    const json = await response.json();
    return json.username;
  }

  async userInfo(username) {
    const response = await this.get(`/api/v1/user/${username}`);
    return await response.json();
  }

  async checkSchoolExists(name) {
    try {
      await this.head(`/api/v1/school/${name}`);
    } catch (e) {
      return false;
    }

    return true;
  }

  async getSchool(school_name) {
    const response = await this.get(`/api/v1/school/${school_name}`);
    return await response.json();
  }

  async schools() {
    const response = await this.get('/api/v1/schools');
    return await response.json();
  }

  async userPosts(username) {
    const response = await this.get(`/api/v1/posts/user/${username}`);
    return await response.json();
  }

  async relatedPosts(postId) {
    const response = await this.get(`/api/v1/post/${postId}/related-posts`);
    return await response.json();
  }

  async userTags() {
    const response = await this.get(`/api/v1/user/tags`);
    return await response.json();
  }

  async userLikedPosts() {
    const response = await this.get(`/api/v1/posts/liked`);
    return await response.json();
  }

  async schoolPosts(schoolUrlName) {
    const response = await this.get(`/api/v1/posts/school/${schoolUrlName}`);
    return await response.json();
  }

  async getLikedPosts(username) {
    const response = await this.get(`/api/v1/posts/liked/${username}`);
    return await response.json();
  }

  async userFavouredPosts() {
    const response = await this.get(`/api/v1/posts/favoured`);
    return await response.json();
  }

  async getFavouredPosts(username) {
    const response = await this.get(`/api/v1/posts/favoured/${username}`);
    return await response.json();
  }

  async tagPosts(tag) {
    const response = await this.get(`/api/v1/posts/tag/${tag}`);
    return await response.json();
  }

  async geotagPosts(geotagUrlName) {
    const response = await this.get(`/api/v1/posts/geotag/${geotagUrlName}`);
    return await response.json();
  }

  async city(city_id) {
    const response = await this.get(`/api/v1/city/${city_id}`);
    return await response.json();
  }

  async countries() {
    const response = await this.get(`/api/v1/countries/`);
    return await response.json();
  }

  async country(country_code) {
    const response = await this.get(`/api/v1/country/${country_code}`);
    return await response.json();
  }

  async like(postId) {
    const response = await this.post(`/api/v1/post/${postId}/like`);
    return response.body;
  }

  async unlike(postId) {
    const response = await this.post(`/api/v1/post/${postId}/unlike`);
    return response.body;
  }

  async likeHashtag(name) {
    const response = await this.post(`/api/v1/tag/${name}/like`);
    return response.body;
  }

  async unlikeHashtag(name) {
    const response = await this.post(`/api/v1/tag/${name}/unlike`);
    return response.body;
  }

  async likeSchool(urlName) {
    const response = await this.post(`/api/v1/school/${urlName}/like`);
    return response.body;
  }

  async unlikeSchool(urlName) {
    const response = await this.post(`/api/v1/school/${urlName}/unlike`);
    return response.body;
  }

  async likeGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/like`);
    return response.body;
  }

  async unlikeGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/unlike`);
    return response.body;
  }

  async fav(postId) {
    const response = await this.post(`/api/v1/post/${postId}/fav`);
    return response.body;
  }

  async unfav(postId) {
    const response = await this.post(`/api/v1/post/${postId}/unfav`);
    return response.body;
  }

  async follow(userName) {
    const response = await this.post(`/api/v1/user/${userName}/follow`);
    return response.body;
  }

  async ignoreUser(userName) {
    const response = await this.post(`/api/v1/user/${userName}/ignore`);
    return response.body;
  }

  async updateUser(user) {
    const response = await this.postJSON(`/api/v1/user`, user);
    return response.body;
  }

  async changePassword(old_password, new_password) {
    const response = await this.postJSON(`/api/v1/user/password`, { old_password, new_password });
    return response.body;
  }

  async resetPassword(email) {
    const response = await this.postJSON(`/api/v1/resetpassword`, { email });

    return response.body;
  }

  async newPassword(hash, password, password_repeat) {
    const response = await this.postJSON(`/api/v1/newpassword/${hash}`, { password, password_repeat });
    return response.body;
  }

  async unfollow(userName) {
    const response = await this.post(`/api/v1/user/${userName}/unfollow`);
    return response.body;
  }

  async registerUser(userData) {
    const response = await this.post(`/api/v1/users`, userData);
    return response.body;
  }

  async login(loginData) {
    const response = await this.post(`/api/v1/session`, loginData);
    return response.body;
  }

  async userSuggestions() {
    const response = await this.get(`/api/v1/suggestions/personalized`);
    return await response.json();
  }

  async userRecentHashtags() {
    const response = await this.get('/api/v1/user/recent-hashtags');
    return await response.json();
  }

  async userRecentSchools() {
    const response = await this.get('/api/v1/user/recent-schools');
    return await response.json();
  }

  async userRecentGeotags() {
    const response = await this.get('/api/v1/user/recent-geotags');
    return await response.json();
  }

  async initialSuggestions() {
    const response = await this.get(`/api/v1/suggestions/initial`);
    return await response.json();
  }

  async postInfo(uuid) {
    const response = await this.get(`/api/v1/post/${uuid}`);
    return await response.json();
  }

  async createPost(type, data) {
    data.type = type;
    const response = await this.postJSON(`/api/v1/posts`, data);
    return response.body;
  }

  async updatePost(uuid, data) {
    const response = await this.postJSON(`/api/v1/post/${uuid}`, data);
    return response.body;
  }

  async deletePost(uuid) {
    const response = await this.del(`/api/v1/post/${uuid}`);
    return response.body;
  }

  async updateGeotag(uuid, data) {
    const response = await this.postJSON(`/api/v1/geotag/${uuid}`, data);
    return response.body;
  }

  async updateHashtag(uuid, data) {
    const response = await this.postJSON(`/api/v1/tag/${uuid}`, data);
    return response.body;
  }

  async updateSchool(uuid, data) {
    const response = await this.postJSON(`/api/v1/school/${uuid}`, data);
    return response.body;
  }

  async pickpoint(options) {
    const response = await this.get('/api/v1/pickpoint', options);
    return await response.json();
  }

  async search(query) {
    const response = await this.get(`/api/v1/search/${query}`);
    return response.body;
  }

  async tagCloud() {
    const response = await this.get('/api/v1/tag-cloud');
    return await response.json();
  }

  async searchHashtags(query) {
    const response = await this.get(`/api/v1/tags/search/${query}`);
    return await response.json();
  }

  async followTag(name) {
    const response = await this.post(`/api/v1/tag/${name}/follow`);
    return response.body;
  }

  async unfollowTag(name) {
    const response = await this.post(`/api/v1/tag/${name}/unfollow`);
    return response.body;
  }

  async schoolCloud() {
    const response = await this.get('/api/v1/school-cloud');
    return await response.json();
  }

  async searchSchools(query) {
    const response = await this.get(`/api/v1/schools/search/${query}`);
    return response.body;
  }

  async followSchool(name) {
    const response = await this.post(`/api/v1/school/${name}/follow`);
    return response.body;
  }

  async unfollowSchool(name) {
    const response = await this.post(`/api/v1/school/${name}/unfollow`);
    return response.body;
  }

  async geotagCloud() {
    const response = await this.get('/api/v1/geotag-cloud');
    return await response.json();
  }

  async followGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/follow`);
    return response.body;
  }

  async unfollowGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/unfollow`);
    return response.body;
  }

  async checkGeotagExists(name) {
    try {
      await this.head(`/api/v1/geotag/${name}`);
    } catch (e) {
      return false;
    }

    return true;
  }

  async getGeotag(urlName) {
    const response = await this.get(`/api/v1/geotag/${urlName}`);
    return await response.json();
  }

  async getHashtag(name) {
    const response = await this.get(`/api/v1/tag/${name}`);
    return await response.json();
  }

  async searchGeotags(query) {
    const response = await this.get(`/api/v1/geotags/search/${query}`);
    return await response.json();
  }

  async getQuotes() {
    const response = await this.get('/api/v1/quotes');
    return await response.json();
  }

  async uploadImage(images) {
    const data = new FormData;
    images.forEach((image) => {
      data.append("files", image);
    });
    const response = await this.postMultipart('/api/v1/upload', data);
    return response.body;
  }

  async processImage(id, transforms, derived_id = null) {
    const response = await this.postJSON('/api/v1/image', {
      original_id: id,
      transforms: JSON.stringify(transforms),
      derived_id
    });
    return response.body;
  }

  async createComment(postId, text) {
    try {
      const response = await this.post(`/api/v1/post/${postId}/comments`, {
        text
      });
      return response.body;
    } catch (err) {
      return err.response.body;
    }
  }

  async deleteComment(postId, commentId) {
    try {
      const response = await this.del(`/api/v1/post/${postId}/comment/${commentId}`);
      return response.body;
    } catch (err) {
      return err.response.body;
    }
  }

  async saveComment(postId, commentId, text) {
    try {
      const response = await this.post(`/api/v1/post/${postId}/comment/${commentId}`, {
        text
      });
      return response.body;
    } catch (err) {
      return err.response.body;
    }
  }
}
