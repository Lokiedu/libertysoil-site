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

  async get(relativeUrl, query = {}) {
    let req = request
      .get(this.apiUrl(relativeUrl))
      .query(query);

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

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

  /*
    *post without setting content type
  */

  async postMultipart(relativeUrl, data=null) {
    let req = request.post(this.apiUrl(relativeUrl));

    if (this.serverReq !== null && 'cookie' in this.serverReq.headers) {
      req = req.set('Cookie', this.serverReq.headers['cookie']);
    }

    if (data !== null) {
      req = req.send(data);
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

  async subscriptions(offset = 0) {
    let response = await this.get(`/api/v1/posts?offset=${offset}`);
    return response.body;
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
    let response = await this.get(`/api/v1/user/available-username/${username}`);
    return response.body.username;
  }

  async userInfo(username) {
    let response = await this.get(`/api/v1/user/${username}`);
    return response.body;
  }

  async checkSchoolExists(name) {
    try {
      await this.head(`/api/v1/school/${name}`);
    } catch (e) {
      return false;
    }

    return true;
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

  async relatedPosts(postId) {
    let response = await this.get(`/api/v1/post/${postId}/related-posts`);
    return response.body;
  }

  async userTags() {
    let response = await this.get(`/api/v1/user/tags`);
    return response.body;
  }

  async userLikedPosts() {
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

  async userFavouredPosts() {
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

  async geotagPosts(geotagUrlName) {
    let response = await this.get(`/api/v1/posts/geotag/${geotagUrlName}`);
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

  async like(postId) {
    let response = await this.post(`/api/v1/post/${postId}/like`);
    return response.body;
  }

  async unlike(postId) {
    let response = await this.post(`/api/v1/post/${postId}/unlike`);
    return response.body;
  }

  async likeHashtag(name) {
    let response = await this.post(`/api/v1/tag/${name}/like`);
    return response.body;
  }

  async unlikeHashtag(name) {
    let response = await this.post(`/api/v1/tag/${name}/unlike`);
    return response.body;
  }

  async likeSchool(urlName) {
    let response = await this.post(`/api/v1/school/${urlName}/like`);
    return response.body;
  }

  async unlikeSchool(urlName) {
    let response = await this.post(`/api/v1/school/${urlName}/unlike`);
    return response.body;
  }

  async likeGeotag(urlName) {
    let response = await this.post(`/api/v1/geotag/${urlName}/like`);
    return response.body;
  }

  async unlikeGeotag(urlName) {
    let response = await this.post(`/api/v1/geotag/${urlName}/unlike`);
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

  async ignoreUser(userName) {
    let response = await this.post(`/api/v1/user/${userName}/ignore`);
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

  async userRecentHashtags() {
    let response = await this.get('/api/v1/user/recent-hashtags');
    return response.body;
  }

  async userRecentSchools() {
    let response = await this.get('/api/v1/user/recent-schools');
    return response.body;
  }

  async userRecentGeotags() {
    let response = await this.get('/api/v1/user/recent-geotags');
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

  async pickpoint(options) {
    let response = await this.get('/api/v1/pickpoint', options);
    return response.body;
  }

  async tagCloud() {
    let response = await this.get('/api/v1/tag-cloud');
    return response.body;
  }

  async searchTags(query) {
    let response = await this.get(`/api/v1/tags/search/${query}`);
    return response.body;
  }

  async followTag(name) {
    let response = await this.post(`/api/v1/tag/${name}/follow`);
    return response.body;
  }

  async unfollowTag(name) {
    let response = await this.post(`/api/v1/tag/${name}/unfollow`);
    return response.body;
  }

  async schoolCloud() {
    let response = await this.get('/api/v1/school-cloud');
    return response.body;
  }

  async followSchool(name) {
    let response = await this.post(`/api/v1/school/${name}/follow`);
    return response.body;
  }

  async unfollowSchool(name) {
    let response = await this.post(`/api/v1/school/${name}/unfollow`);
    return response.body;
  }

  async followGeotag(urlName) {
    let response = await this.post(`/api/v1/geotag/${urlName}/follow`);
    return response.body;
  }

  async unfollowGeotag(urlName) {
    let response = await this.post(`/api/v1/geotag/${urlName}/unfollow`);
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
    let response = await this.get(`/api/v1/geotag/${urlName}`);
    return response.body;
  }

  async searchGeotags(query) {
    let response = await this.get(`/api/v1/geotags/search/${query}`);
    return response.body;
  }

  async uploadImage(images) {
    let data = new FormData;
    images.forEach((image) => {
      data.append("files", image);
    })
    let response = await this.postMultipart('/api/v1/upload', data);
    return response.body;
  }

  async processImage(id, transforms, derived_id=null) {
    let response = await this.postJSON('/api/v1/image', {original_id: id, transforms: JSON.stringify(transforms), derived_id: derived_id});
    return response.body;
  }

  async createComment(post_id, text) {
    let response = await this.post(`/api/v1/post/${post_id}/comments`, {
      text
    });
    return response.body;
  }

  async deleteComment(postId, commentId) {
    try {
      let response = await this.del(`/api/v1/post/${postId}/comment/${commentId}`);
      return response.body;
    } catch (err) {
      return err.response.body;
    }
  }

  async saveComment(postId, commentId, text) {
    try {
      let response = await this.post(`/api/v1/post/${postId}/comment/${commentId}`, {
        text
      });
      return response.body;
    } catch (err) {
      return err.response.body;
    }
  }
}
