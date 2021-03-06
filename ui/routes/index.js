import React from 'react';

import {
  hashHistory,
  Router,
  Route,
  IndexRoute,
  IndexRedirect,
} from 'react-router';

import App from '../containers/app';
import Front from '../containers/front';
import Login from '../containers/login';
import Signup from '../containers/signup';
import Search from '../containers/search';
import Latest from '../containers/latest';
import Recent from '../containers/recent';
import Categories from '../containers/categories';
import Category from '../containers/category';
import Subscriptions from '../containers/subscriptions';
import Recommendations from '../containers/recommendations';
import Bookmarks from '../containers/bookmarks';
import Channel from '../containers/channel';
import Podcast from '../containers/podcast';
import User from '../containers/user';
import PageNotFound from '../containers/not_found';

import * as actionCreators from '../actions';
import { bindAllActionCreators } from '../actions/utils';

export default function (store) {
  const actions = bindAllActionCreators(actionCreators, store.dispatch);

  const requireAuth = (nextState, replace) => {
    const { auth } = store.getState();
    if (!auth.isLoggedIn) {
      actions.alerts.warning('You have to be signed in first');
      actions.auth.loginRequired(nextState.location.pathname);
      replace('/login/');
    }
  };

  const redirectIfLoggedIn = (_, replace) => {
    const { auth } = store.getState();
    if (auth.isLoggedIn) {
      replace('/new/');
    }
  };

  const getSubscriptions = () => actions.channels.getSubscriptions();
  const getRecommendations = () => actions.channels.getRecommendations();
  const getBookmarks = () => actions.bookmarks.getBookmarks();
  const getRecentlyPlayed = () => actions.plays.getRecentlyPlayed();
  const getLatestPodcasts = () => actions.latest.getLatestPodcasts();
  const getCategory = nextState => actions.categories.getCategory(nextState.params.id);
  const getChannel = nextState => actions.channel.getChannel(nextState.params.id);
  const getPodcast = nextState => actions.podcasts.getPodcast(nextState.params.id);
  const getSearch = nextState => {
    const query = nextState.location ? nextState.location.query : null;
    if (query) {
      actions.search.search(query.q, query.t);
    }
  };

  const scrollUp = () => window.scrollTo(0, 0);

  return (
    <Router history={hashHistory} onUpdate={scrollUp}>
      <Route path="/" component={App}>

        <IndexRoute
          component={Front}
          onEnter={redirectIfLoggedIn}
        />

        <Route path="/member/" onEnter={requireAuth}>

          <IndexRedirect to="/member/subscriptions/" />

          <Route
            path="/member/subscriptions/"
            component={Subscriptions}
            onEnter={getSubscriptions}
          />

          <Route
            path="/member/bookmarks/"
            component={Bookmarks}
            onEnter={getBookmarks}
          />

         <Route
           path="/member/recent/"
           component={Recent}
           onEnter={getRecentlyPlayed}
         />
       </Route>

      <Route
        path="/new/"
        component={Latest}
        onEnter={getLatestPodcasts}
      />

      <Route
        path="/browse/"
        component={Categories}
      />

      <Route
        path="/recommendations/"
        component={Recommendations}
        onEnter={getRecommendations}
      />

      <Route
        path="/search/"
        component={Search}
        onEnter={getSearch}
      />

      <Route
        path="/categories/:id/"
        component={Category}
        onEnter={getCategory}
      />

      <Route
        path="/channel/:id/"
        component={Channel}
        onEnter={getChannel}
      />

      <Route
        path="/podcast/:id/"
        component={Podcast}
        onEnter={getPodcast}
      />

      <Route path="/login/" component={Login} />
      <Route path="/signup/" component={Signup} />
      <Route path="/user/" component={User} onEnter={requireAuth} />
      <Route path="*" component={PageNotFound} />
      </Route>
    </Router>
  );
}
