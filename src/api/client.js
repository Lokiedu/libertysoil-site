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
import fetch from 'isomorphic-fetch';
import FormData from 'form-data';
import { format as format_url, parse as parse_url } from 'url';
import { stringify } from 'querystring';
import { extend, merge as mergeObj } from 'lodash';


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

  async handleResponseError(response) {
    if (!response.ok) {
      let json, errorMessage;

      errorMessage = response.statusText;

      try {
        json = await response.json();
        errorMessage = json.error || errorMessage;
      } catch (e) {
        throw new Error(errorMessage);
      }

      throw new Error(errorMessage);
    }
  }

  async get(relativeUrl, query = {}) {
    let defaultHeaders = {};

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      defaultHeaders = { Cookie: this.serverReq.headers['cookie'] };
    }

    const response = await fetch(
      this.apiUrlForFetch(relativeUrl, query),
      {
        credentials: 'same-origin',
        headers: defaultHeaders
      }
    );

    await this.handleResponseError(response);

    return response;
  }

  async head(relativeUrl, query = {}) {
    let defaultHeaders = {};

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      defaultHeaders = { Cookie: this.serverReq.headers['cookie'] };
    }

    return fetch(
      this.apiUrlForFetch(relativeUrl, query),
      {
        credentials: 'same-origin',
        method: 'HEAD',
        headers: defaultHeaders
      }
    );
  }

  async del(relativeUrl) {
    let defaultHeaders = {};

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      defaultHeaders = { Cookie: this.serverReq.headers['cookie'] };
    }

    const response = await fetch(
      this.apiUrlForFetch(relativeUrl),
      {
        credentials: 'same-origin',
        method: 'DELETE',
        headers: defaultHeaders
      }
    );
    await this.handleResponseError(response);

    return response;
  }

  async post(relativeUrl, data = null) {
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body;

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      headers = {
        Cookie: this.serverReq.headers['cookie'],
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }

    if (data !== null) {
      body = stringify(data);
    }

    const response = await fetch(
      this.apiUrl(relativeUrl),
      {
        credentials: 'same-origin',
        method: 'POST',
        headers,
        body
      }
    );

    await this.handleResponseError(response);

    return response;
  }

  /*
    *post without setting content type
  */

  async postMultipart(relativeUrl, data = null) {
    let headers = {},
      body;

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      headers = {
        Cookie: this.serverReq.headers['cookie']
      };
    }

    if (data !== null) {
      body = data;
    }

    const response = await fetch(
      this.apiUrl(relativeUrl),
      {
        credentials: 'same-origin',
        method: 'POST',
        headers,
        body
      }
    );
    await this.handleResponseError(response);

    return response;
  }

  async postJSON(relativeUrl, data = null) {
    let headers = {
        'Content-Type': 'application/json'
      },
      body;

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      headers = {
        Cookie: this.serverReq.headers['cookie'],
        'Content-Type': 'application/json'
      };
    }

    if (data !== null) {
      body = JSON.stringify(data);
    }

    const response = await fetch(
      this.apiUrl(relativeUrl),
      {
        credentials: 'same-origin',
        method: 'POST',
        headers,
        body
      }
    );
    await this.handleResponseError(response);

    return response;
  }

  async subscriptions(offset = 0) {
    const response = await this.get(`/api/v1/posts?offset=${offset}`);
    return await response.json();
  }

  async checkUserExists(username) {
    const result = await this.head(`/api/v1/user/${username}`);

    return result.ok;
  }

  async checkEmailTaken(email) {
    const result = await this.head(`/api/v1/user/email/${email}`);

    return result.ok;
  }

  async getAvailableUsername(username) {
    let json;
    const response = await this.get(`/api/v1/user/available-username/${username}`);

    if (!response.ok) {
      json = await response.json();
      const error = json.error || response.statusText;
      throw new Error(error);
    }

    json = await response.json();

    return json.username;
  }

  async userInfo(username) {
    const response = await this.get(`/api/v1/user/${username}`);
    return await response.json();
  }

  async checkSchoolExists(name) {
    const result = await this.head(`/api/v1/school/${name}`);

    return result.ok;
  }

  async getSchool(school_name) {
    const response = await this.get(`/api/v1/school/${school_name}`);
    return await response.json();
  }

  async schools(query = {}) {
    const response = await this.get('/api/v1/schools', query);
    return await response.json();
  }

  async schoolsAlphabet() {
    const response = await this.get('/api/v1/schools-alphabet');
    return await response.json();
  }

  async userPosts(username, query = {}) {
    const response = await this.get(`/api/v1/posts/user/${username}`, query);
    return await response.json();
  }

  async relatedPosts(postId) {
    const response = await this.get(`/api/v1/post/${postId}/related-posts`);

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error);
    }

    return json;
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
    return await response.json();
  }

  async unlike(postId) {
    const response = await this.post(`/api/v1/post/${postId}/unlike`);
    return await response.json();
  }

  async likeHashtag(name) {
    const response = await this.post(`/api/v1/tag/${name}/like`);
    return await response.json();
  }

  async unlikeHashtag(name) {
    const response = await this.post(`/api/v1/tag/${name}/unlike`);
    return await response.json();
  }

  async likeSchool(urlName) {
    const response = await this.post(`/api/v1/school/${urlName}/like`);
    return await response.json();
  }

  async unlikeSchool(urlName) {
    const response = await this.post(`/api/v1/school/${urlName}/unlike`);
    return await response.json();
  }

  async likeGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/like`);
    return await response.json();
  }

  async unlikeGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/unlike`);
    return await response.json();
  }

  async fav(postId) {
    const response = await this.post(`/api/v1/post/${postId}/fav`);
    return await response.json();
  }

  async unfav(postId) {
    const response = await this.post(`/api/v1/post/${postId}/unfav`);
    return await response.json();
  }

  async follow(userName) {
    const response = await this.post(`/api/v1/user/${userName}/follow`);
    return await response.json();
  }

  async ignoreUser(userName) {
    const response = await this.post(`/api/v1/user/${userName}/ignore`);
    return await response.json();
  }

  async updateUser(user) {
    const response = await this.postJSON(`/api/v1/user`, user);
    return await response.json();
  }

  async changePassword(old_password, new_password) {
    const response = await this.postJSON(`/api/v1/user/password`, { old_password, new_password });

    if (response.status !== 200) {
      const e = extend(new Error(response.statusText), { response: await response.json() });
      throw e;
    }

    return response.json();
  }

  async resetPassword(email) {
    const response = await this.postJSON(`/api/v1/resetpassword`, { email });

    return await response.json();
  }

  async newPassword(hash, password, password_repeat) {
    const response = await this.postJSON(`/api/v1/newpassword/${hash}`, { password, password_repeat });
    return await response.json();
  }

  async unfollow(userName) {
    const response = await this.post(`/api/v1/user/${userName}/unfollow`);
    return await response.json();
  }

  async registerUser(userData) {
    const response = await this.post(`/api/v1/users`, userData);
    return await response.json();
  }

  async login(loginData) {
    const response = await this.post(`/api/v1/session`, loginData);
    return await response.json();
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
    return await response.json();
  }

  async updatePost(uuid, data) {
    const response = await this.postJSON(`/api/v1/post/${uuid}`, data);
    return await response.json();
  }

  async deletePost(uuid) {
    const response = await this.del(`/api/v1/post/${uuid}`);
    return await response.json();
  }

  async updateGeotag(uuid, data) {
    const response = await this.postJSON(`/api/v1/geotag/${uuid}`, data);
    return await response.json();
  }

  async updateHashtag(uuid, data) {
    const response = await this.postJSON(`/api/v1/tag/${uuid}`, data);
    return await response.json();
  }

  async updateSchool(uuid, data) {
    const response = await this.postJSON(`/api/v1/school/${uuid}`, data);
    return await response.json();
  }

  async pickpoint(options) {
    const response = await this.get('/api/v1/pickpoint', options);
    return await response.json();
  }

  async search(query) {
    const response = await this.get(`/api/v1/search/${query}`);
    return await response.json();
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
    return await response.json();
  }

  async unfollowTag(name) {
    const response = await this.post(`/api/v1/tag/${name}/unfollow`);
    return await response.json();
  }

  async schoolCloud() {
    const response = await this.get('/api/v1/school-cloud');
    return await response.json();
  }

  async searchSchools(query) {
    const response = await this.get(`/api/v1/schools/search/${query}`);
    return await response.json();
  }

  async followSchool(name) {
    const response = await this.post(`/api/v1/school/${name}/follow`);
    return await response.json();
  }

  async unfollowSchool(name) {
    const response = await this.post(`/api/v1/school/${name}/unfollow`);
    return await response.json();
  }

  async geotagCloud() {
    const response = await this.get('/api/v1/geotag-cloud');
    return await response.json();
  }

  async followGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/follow`);
    return await response.json();
  }

  async unfollowGeotag(urlName) {
    const response = await this.post(`/api/v1/geotag/${urlName}/unfollow`);
    return await response.json();
  }

  async checkGeotagExists(name) {
    const result = await this.head(`/api/v1/geotag/${name}`);

    return result.ok;
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

    return await response.json();
  }

  async processImage(id, transforms, derived_id = null) {
    const response = await this.postJSON('/api/v1/image', {
      original_id: id,
      transforms: JSON.stringify(transforms),
      derived_id
    });
    return await response.json();
  }

  async createComment(postId, text) {
    const response = await this.post(`/api/v1/post/${postId}/comments`, {
      text
    });
    return await response.json();
  }

  async deleteComment(postId, commentId) {
    const response = await this.del(`/api/v1/post/${postId}/comment/${commentId}`);
    return await response.json();
  }

  async saveComment(postId, commentId, text) {
    const response = await this.post(`/api/v1/post/${postId}/comment/${commentId}`, {
      text
    });
    return await response.json();
  }

  async subscribeToPost(postId) {
    const response = await this.post(`/api/v1/post/${postId}/subscribe`);
    return await response.json();
  }

  async unsubscribeFromPost(postId) {
    const response = await this.post(`/api/v1/post/${postId}/unsubscribe`);
    return await response.json();
  }
}
