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

 @flow
*/
import { format as format_url, parse as parse_url } from 'url';
import { stringify } from 'querystring';

import fetch from 'isomorphic-fetch';
import FormData from 'form-data';
import { extend, merge as mergeObj } from 'lodash';

import type { Email, Integer, Success, UrlNode } from '../definitions/common';
import type { GeotagId, Geotag, Continent } from '../definitions/geotags';
import type { HashtagId, Hashtag } from '../definitions/hashtags';
import type { SchoolId, School } from '../definitions/schools';
import type { Password, UserId, UserRecentTags, UserMore, User, Username } from '../definitions/users';
import type { PostDraftData, Post, PostType, PostId } from '../definitions/posts';
import type { Attachment } from '../definitions/attachments';
import type { ProfilePost, ProfilePostId, ProfilePostDraftData } from '../definitions/profile-posts';
import type { SearchResponse, SearchQuery } from '../definitions/search';

type ServerReq = {
  headers: { cookie?: string }
};

export default class ApiClient {
  host: string;
  serverReq: ?ServerReq = null;

  constructor(host: string, serverReq: ?ServerReq = null) {
    this.host = host;
    this.serverReq = serverReq;
  }

  apiUrl(relativeUrl: string): string {
    return `${this.host}${relativeUrl}`;
  }

  apiUrlForFetch(relativeUrl: string, query: ?Object = {}): string {
    // $FlowIssue flow incorrectly loads declaration of `url.parse`
    const urlObj: { query: ?Object } = parse_url(this.apiUrl(relativeUrl), true);
    urlObj.query = mergeObj(urlObj.query, query);

    return format_url(urlObj);
  }

  async handleResponseError(response: Response) {
    if (!response.ok) {
      let json: { error?: string }, errorMessage, e;

      errorMessage = response.statusText;
      const status = response.status;

      try {
        json = await response.json();
        errorMessage = json.error || errorMessage;
        e = extend(
          new Error(errorMessage),
          {
            status,
            response: json
          }
        );
      } catch (e) {
        throw new Error(errorMessage);
      }

      throw e;
    }
  }

  async get(relativeUrl: string, query: ?Object = {}): Promise<Response> {
    let defaultHeaders = {};

    if (this.serverReq && this.serverReq.headers.cookie) {
      defaultHeaders = { Cookie: this.serverReq.headers.cookie };
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

  async head(relativeUrl: string, query: ?Object = {}): Promise<Response> {
    let defaultHeaders = {};

    if (this.serverReq && this.serverReq.headers.cookie) {
      defaultHeaders = { Cookie: this.serverReq.headers.cookie };
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

  async del(relativeUrl: string): Promise<Response> {
    let defaultHeaders = {};

    if (this.serverReq && this.serverReq.headers.cookie) {
      defaultHeaders = { Cookie: this.serverReq.headers.cookie };
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

  async post(relativeUrl: string, data: any = null): Promise<Response> {
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body;

    if (this.serverReq && this.serverReq.headers.cookie) {
      headers = {
        Cookie: this.serverReq.headers.cookie,
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

  async postMultipart(relativeUrl: string, data: any = null): Promise<Response> {
    let headers = {}, body;

    if (this.serverReq && this.serverReq.headers.cookie) {
      headers = {
        Cookie: this.serverReq.headers.cookie
      };
    }

    if (data) {
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

  async postJSON(relativeUrl: string, data: any = null): Promise<Response> {
    let headers = {
        'Content-Type': 'application/json'
      },
      body;

    if (this.serverReq && this.serverReq.headers.cookie) {
      headers = {
        Cookie: this.serverReq.headers.cookie,
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

  async subscriptions(offset: Integer = 0): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts?offset=${offset}`);
    return (await response.json(): Array<Post>);
  }

  async hashtagSubscriptions(query: Object = {}): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/subscriptions/hashtag`, query);
    return await response.json();
  }

  async schoolSubscriptions(query: Object = {}): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/subscriptions/school`, query);
    return await response.json();
  }

  async geotagSubscriptions(query: Object = {}): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/subscriptions/geotag`, query);
    return await response.json();
  }

  async allPosts(query: ?Object = {}): Promise<Array<Post>> {
    const response = await this.get('/api/v1/posts/all', query);
    return (await response.json(): Array<Post>);
  }

  async checkUserExists(username: Username): Promise<boolean> {
    const result = await this.head(`/api/v1/user/${username}`);

    return result.ok;
  }

  async checkEmailTaken(email: Email): Promise<boolean> {
    const result = await this.head(`/api/v1/user/email/${email}`);

    return result.ok;
  }

  async getAvailableUsername(username: Username): Promise<Username> {
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

  async userInfo(username: Username): Promise<User> {
    const response = await this.get(`/api/v1/user/${username}`);
    return (await response.json(): User);
  }

  async followedUsers(userId: UserId): Promise<Array<User>> {
    const response = await this.get(`/api/v1/user/${userId}/following`);
    return (await response.json(): Array<User>);
  }

  async mutualFollows(userId: UserId): Promise<Array<User>> {
    const response = await this.get(`/api/v1/user/${userId}/mutual-follows`);
    return (await response.json(): Array<User>);
  }

  async checkSchoolExists(name: string): Promise<boolean> {
    const result = await this.head(`/api/v1/school/${name}`);

    return result.ok;
  }

  async getSchool(school_name: string): Promise<School> {
    const response = await this.get(`/api/v1/school/${school_name}`);
    return (await response.json(): School);
  }

  async schools(query: ?Object = {}): Promise<{ schools: Array<School> }> {
    const response = await this.get('/api/v1/schools', query);
    return (await response.json(): { schools: Array<School> });
  }

  async schoolsAlphabet(): Promise<Array<string>> {
    const response = await this.get('/api/v1/schools-alphabet');
    return (await response.json(): Array<string>);
  }

  async userPosts(username: Username, query: ?Object = {}): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/user/${username}`, query);
    return (await response.json(): Array<Post>);
  }

  async relatedPosts(postId: PostId): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/post/${postId}/related-posts`);

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error);
    }

    return (json: Array<Post>);
  }

  async userTags(): Promise<UserRecentTags> {
    const response = await this.get(`/api/v1/user/tags`);
    return (await response.json(): UserRecentTags);
  }

  async userLikedPosts(): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/liked`);
    return (await response.json(): Array<Post>);
  }

  async schoolPosts(schoolUrlName: UrlNode): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/school/${schoolUrlName}`);
    return (await response.json(): Array<Post>);
  }

  async getLikedPosts(username: Username): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/liked/${username}`);
    return (await response.json(): Array<Post>);
  }

  async userFavouredPosts(): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/favoured`);
    return (await response.json(): Array<Post>);
  }

  async getFavouredPosts(username: Username): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/favoured/${username}`);
    return (await response.json(): Array<Post>);
  }

  async tagPosts(tag: UrlNode): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/tag/${tag}`);
    return (await response.json(): Array<Post>);
  }

  async geotagPosts(geotagUrlName: UrlNode): Promise<Array<Post>> {
    const response = await this.get(`/api/v1/posts/geotag/${geotagUrlName}`);
    return (await response.json(): Array<Post>);
  }

  async city(city_id: GeotagId): Promise<Geotag> {
    const response = await this.get(`/api/v1/city/${city_id}`);
    return (await response.json(): Geotag);
  }

  async countries(): Promise<Array<Geotag>> {
    const response = await this.get(`/api/v1/countries/`);
    return (await response.json(): Array<Geotag>);
  }

  async country(country_code: string): Promise<Geotag> {
    const response = await this.get(`/api/v1/country/${country_code}`);
    return (await response.json(): Geotag);
  }

  async like(postId: PostId): Promise<Success & { likes: Array<PostId>, likers: Array<UserId> }> {
    const response = await this.post(`/api/v1/post/${postId}/like`);
    return (await response.json(): Success & { likes: Array < PostId >, likers: Array<UserId> });
  }

  async unlike(postId: PostId): Promise<Success & { likes: Array<PostId>, likers: Array<UserId> }> {
    const response = await this.post(`/api/v1/post/${postId}/unlike`);
    return (await response.json(): Success & { likes: Array < PostId >, likers: Array<UserId> });
  }

  async likeHashtag(name: UrlNode): Promise<Success & { hashtag: Hashtag }> {
    const response = await this.post(`/api/v1/tag/${name}/like`);
    return (await response.json(): Success & { hashtag: Hashtag });
  }

  async unlikeHashtag(name: UrlNode): Promise<Success & { hashtag: Hashtag }> {
    const response = await this.post(`/api/v1/tag/${name}/unlike`);
    return (await response.json(): Success & { hashtag: Hashtag });
  }

  async likeSchool(urlName: UrlNode): Promise<Success & { school: School }> {
    const response = await this.post(`/api/v1/school/${urlName}/like`);
    return (await response.json(): Success & { school: School });
  }

  async unlikeSchool(urlName: UrlNode): Promise<Success & { school: School }> {
    const response = await this.post(`/api/v1/school/${urlName}/unlike`);
    return (await response.json(): Success & { school: School });
  }

  async likeGeotag(urlName: UrlNode): Promise<Success & { geotag: Geotag }> {
    const response = await this.post(`/api/v1/geotag/${urlName}/like`);
    return (await response.json(): Success & { geotag: Geotag });
  }

  async unlikeGeotag(urlName: UrlNode): Promise<Success & { geotag: Geotag }> {
    const response = await this.post(`/api/v1/geotag/${urlName}/unlike`);
    return (await response.json(): Success & { geotag: Geotag });
  }

  async fav(postId: PostId): Promise<Success & { favourites: Array<PostId>, favourers: Array<UserId> }> {
    const response = await this.post(`/api/v1/post/${postId}/fav`);
    return (await response.json(): Success & { favourites: Array < PostId >, favourers: Array<UserId> });
  }

  async unfav(postId: PostId): Promise<Success & { favourites: Array<PostId>, favourers: Array<UserId> }> {
    const response = await this.post(`/api/v1/post/${postId}/unfav`);
    return (await response.json(): Success & { favourites: Array < PostId >, favourers: Array<UserId> });
  }

  async follow(userName: Username): Promise<Success & { user1: User, user2: User }> {
    const response = await this.post(`/api/v1/user/${userName}/follow`);
    return (await response.json(): Success & { user1: User, user2: User });
  }

  async ignoreUser(userName: Username): Promise<Success> {
    const response = await this.post(`/api/v1/user/${userName}/ignore`);
    return (await response.json(): Success);
  }

  async updateUser(user: { more: UserMore }): Promise<User> {
    const response = await this.postJSON(`/api/v1/user`, user);
    return (await response.json(): User);
  }

  async changePassword(old_password: Password, new_password: Password): Promise<Success> {
    const response = await this.postJSON(`/api/v1/user/password`, { old_password, new_password });

    if (response.status !== 200) {
      const e = extend(new Error(response.statusText), { response: await response.json() });
      throw e;
    }

    return (await response.json(): Success);
  }

  async resetPassword(email: Email): Promise<Success> {
    const response = await this.postJSON(`/api/v1/resetpassword`, { email });

    return (await response.json(): Success);
  }

  async newPassword(hash: string, password: Password, password_repeat: Password): Promise<Success> {
    const response = await this.postJSON(`/api/v1/newpassword/${hash}`, { password, password_repeat });
    return (await response.json(): Success);
  }

  async unfollow(userName: Username): Promise<Success & { user1: User, user2: User }> {
    const response = await this.post(`/api/v1/user/${userName}/unfollow`);
    return (await response.json(): Success & { user1: User, user2: User });
  }

  // TODO: Type annotations
  async sendMessage(userId: UserId, text: string) {
    const response = await this.postJSON(`/api/v1/user/${userId}/messages`, { text });
    return await response.json();
  }

  // TODO: Type annotations
  async userMessages(userId: UserId) {
    const response = await this.get(`/api/v1/user/${userId}/messages`);
    return await response.json();
  }

  async registerUser(userData: Object): Promise<Success & { user: User }> {
    const response = await this.postJSON(`/api/v1/users`, userData);
    return (await response.json(): Success & { user: User });
  }

  async login(loginData: { password: string, username: string }): Promise<Success & { user: User }> {
    const response = await this.post(`/api/v1/session`, loginData);
    return (await response.json(): Success & { user: User });
  }

  async userSuggestions(): Promise<Array<User>> {
    const response = await this.get(`/api/v1/suggestions/personalized`);
    return (await response.json(): Array<User>);
  }

  async userRecentHashtags(): Promise<Array<Hashtag>> {
    const response = await this.get('/api/v1/user/recent-hashtags');
    return (await response.json(): Array<Hashtag>);
  }

  async userRecentSchools(): Promise<Array<School>> {
    const response = await this.get('/api/v1/user/recent-schools');
    return (await response.json(): Array<School>);
  }

  async userRecentGeotags(): Promise<Array<Geotag>> {
    const response = await this.get('/api/v1/user/recent-geotags');
    return (await response.json(): Array<Geotag>);
  }

  async recentlyUsedTags(): Promise<UserRecentTags> {
    const response = await this.get('/api/v1/recent-tags');
    return (await response.json(): UserRecentTags);
  }

  async initialSuggestions(): Promise<Array<User>> {
    const response = await this.get(`/api/v1/suggestions/initial`);
    return (await response.json(): Array<User>);
  }

  async postInfo(uuid: PostId): Promise<Post> {
    const response = await this.get(`/api/v1/post/${uuid}`);
    return (await response.json(): Post);
  }

  async createPost(type: PostType, data: PostDraftData): Promise<Post> {
    data.type = type;
    const response = await this.postJSON(`/api/v1/posts`, data);
    return (await response.json(): Post);
  }

  async updatePost(uuid: PostId, data: PostDraftData): Promise<Post> {
    const response = await this.postJSON(`/api/v1/post/${uuid}`, data);
    return (await response.json(): Post);
  }

  async deletePost(uuid: PostId): Promise<Success> {
    const response = await this.del(`/api/v1/post/${uuid}`);
    return (await response.json(): Success);
  }

  async updateGeotag(uuid: GeotagId, data: Object): Promise<Geotag> {
    const response = await this.postJSON(`/api/v1/geotag/${uuid}`, data);
    return (await response.json(): Geotag);
  }

  async updateHashtag(uuid: HashtagId, data: Object): Promise<Hashtag> {
    const response = await this.postJSON(`/api/v1/tag/${uuid}`, data);
    return (await response.json(): Hashtag);
  }

  async createSchool(data: Object): Promise<School> {
    const response = await this.postJSON('/api/v1/schools/new', data);
    return (await response.json(): School);
  }

  async updateSchool(uuid: SchoolId, data: Object): Promise<School> {
    const response = await this.postJSON(`/api/v1/school/${uuid}`, data);
    return (await response.json(): School);
  }

  async pickpoint(options: Object): Promise<Object> {
    const response = await this.get('/api/v1/pickpoint', options);
    return (await response.json(): Object);
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const response = await this.get(`/api/v1/search`, query);
    return (await response.json(): SearchResponse);
  }

  async tagCloud(): Promise<Array<Hashtag>> {
    const response = await this.get('/api/v1/tag-cloud');
    return (await response.json(): Array<Hashtag>);
  }

  async searchHashtags(query: string): Promise<Array<Hashtag>> {
    const response = await this.get(`/api/v1/tags/search/${query}`);
    return (await response.json(): Array<Hashtag>);
  }

  async followTag(name: UrlNode): Promise<Success & { hashtag: Hashtag }> {
    const response = await this.post(`/api/v1/tag/${name}/follow`);
    return (await response.json(): Success & { hashtag: Hashtag });
  }

  async unfollowTag(name: UrlNode): Promise<Success & { hashtag: Hashtag }> {
    const response = await this.post(`/api/v1/tag/${name}/unfollow`);
    return (await response.json(): Success & { hashtag: Hashtag });
  }

  async schoolCloud(): Promise<Array<School>> {
    const response = await this.get('/api/v1/school-cloud');
    return (await response.json(): Array<School>);
  }

  async searchSchools(query: string): Promise<Array<School>> {
    const response = await this.get(`/api/v1/schools/search/${query}`);
    return (await response.json(): Array<School>);
  }

  async followSchool(name: UrlNode): Promise<Success & { school: School }> { // TODO: use url_name instead
    const response = await this.post(`/api/v1/school/${name}/follow`);
    return (await response.json(): Success & { school: School });
  }

  async unfollowSchool(name: UrlNode): Promise<Success & { school: School }> { // TODO: use url_name instead
    const response = await this.post(`/api/v1/school/${name}/unfollow`);
    return (await response.json(): Success & { school: School });
  }

  async geotagCloud(): Promise<Array<{
    continent_code: Continent,
    geotag_count: Integer,
    geotags: Array<Geotag>
  }>> {
    const response = await this.get('/api/v1/geotag-cloud');
    return (await response.json(): Array<{
      continent_code: Continent,
      geotag_count: Integer,
      geotags: Array<Geotag>
    }>);
  }

  async followGeotag(urlName: UrlNode): Promise<Success & { geotag: Geotag }> {
    const response = await this.post(`/api/v1/geotag/${urlName}/follow`);
    return (await response.json(): Success & { geotag: Geotag });
  }

  async unfollowGeotag(urlName: UrlNode): Promise<Success & { geotag: Geotag }> {
    const response = await this.post(`/api/v1/geotag/${urlName}/unfollow`);
    return (await response.json(): Success & { geotag: Geotag });
  }

  async checkGeotagExists(name: string): Promise<boolean> {
    const result = await this.head(`/api/v1/geotag/${name}`);

    return result.ok;
  }

  async getGeotag(urlName: UrlNode): Promise<Geotag> {
    const response = await this.get(`/api/v1/geotag/${urlName}`);
    return (await response.json(): Geotag);
  }

  async getGeotags(query: ?Object = {}): Promise<Array<Geotag>> {
    const response = await this.get(`/api/v1/geotags`, query);
    return (await response.json(): Array<Geotag>);
  }

  async getHashtag(name: UrlNode): Promise<Hashtag> {
    const response = await this.get(`/api/v1/tag/${name}`);
    return (await response.json(): Hashtag);
  }

  async searchGeotags(query: string): Promise<Array<Geotag>> {
    const response = await this.get(`/api/v1/geotags/search/${query}`);
    return (await response.json(): Array<Geotag>);
  }

  async getQuotes(): Promise<Array<Object>> {
    const response = await this.get('/api/v1/quotes');
    return (await response.json(): Array<Object>);
  }

  async uploadImage(images: Array<any>): Promise<Array<Attachment>> {
    const data = new FormData;
    images.forEach((image) => {
      data.append("files", image);
    });
    const response = await this.postMultipart('/api/v1/upload', data);

    return (await response.json(): Array<Attachment>);
  }

  async processImage(id: string, transforms: Array<Object>, derived_id: any = null): Promise<Success & Attachment> {
    const response = await this.postJSON('/api/v1/image', {
      original_id: id,
      transforms: JSON.stringify(transforms),
      derived_id
    });
    return (await response.json(): Success & Attachment);
  }

  async createComment(postId: PostId, text: string): Promise<Array<Object>> {
    const response = await this.post(`/api/v1/post/${postId}/comments`, {
      text
    });
    return (await response.json(): Array<Object>);
  }

  async deleteComment(postId: PostId, commentId: string): Promise<Array<Object>> {
    const response = await this.del(`/api/v1/post/${postId}/comment/${commentId}`);
    return (await response.json(): Array<Object>);
  }

  async saveComment(postId: PostId, commentId: string, text: string): Promise<Array<Object>> {
    const response = await this.post(`/api/v1/post/${postId}/comment/${commentId}`, {
      text
    });
    return (await response.json(): Array<Object>);
  }

  async subscribeToPost(postId: PostId): Promise<Success> {
    const response = await this.post(`/api/v1/post/${postId}/subscribe`);
    return (await response.json(): Success);
  }

  async unsubscribeFromPost(postId: PostId): Promise<Success> {
    const response = await this.post(`/api/v1/post/${postId}/unsubscribe`);
    return (await response.json(): Success);
  }

  async profilePosts(username: string, offset: Integer = 0, limit: Integer = 10): Promise<Array<ProfilePost>> {
    const response = await this.get(`/api/v1/user/${username}/profile-posts?offset=${offset}&limit=${limit}`);
    return (await response.json(): Array<ProfilePost>);
  }

  async profilePost(profilePostId: ProfilePostId): Promise<ProfilePost> {
    const response = await this.get(`/api/v1/profile-post/${profilePostId}`);
    return (await response.json(): ProfilePost);
  }

  async createProfilePost(attrs: ProfilePostDraftData): Promise<ProfilePost> {
    const response = await this.post(`/api/v1/profile-posts`, attrs);
    return (await response.json(): ProfilePost);
  }

  async updateProfilePost(profilePostId: ProfilePostId, attrs: ProfilePostDraftData): Promise<ProfilePost> {
    const response = await this.post(`/api/v1/profile-post/${profilePostId}`, attrs);
    return (await response.json(): ProfilePost);
  }

  async deleteProfilePost(profilePostId: ProfilePostId): Promise<Success> {
    const response = await this.del(`/api/v1/profile-post/${profilePostId}`);
    return (await response.json(): Success);
  }

  async getLocale(code: string): Promise<Object> {
    const response = await this.get(`/api/v1/locale/${code}`);
    return await response.json();
  }
}
