import React from 'react';
import { connect } from 'react-redux';
import request from 'superagent';
import _ from 'lodash';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags'
import Sidebar from '../components/sidebar'
import {API_HOST} from '../config';
import {getStore, setUser, setPostsToRiver} from '../store';


class UserPage extends React.Component {
    async componentWillMount() {
        let result = await request.get(`${API_HOST}/api/v1/user/${this.props.params.username}`);
        getStore().dispatch(setUser(result.body));

        result = await request.get(`${API_HOST}/api/v1/posts`);
        getStore().dispatch(setPostsToRiver(result.body));
    }

    render() {
        const current_user = this.props.current_user;

        let user = this.props.user || {};

        return (

            <div>
                <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
                <div className="page__container">
                    <div className="page__body">
                        <Sidebar current_user={current_user} />

                        <div>
                            {user.username}
                        </div>
                        <River river={this.props.river} posts={this.props.posts} users={this.props.users}/>

                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

function select(state) {
    return state.toJS();
}

export default connect(select)(UserPage);
