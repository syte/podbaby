import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Grid,
  Row,
  Col,
  Glyphicon,
  ButtonGroup,
  Button,
  Well,
  Input
} from 'react-bootstrap';

import  * as actions from '../actions';
import PodcastList from './podcasts';
import { sanitize, formatPubDate } from './utils';

const ChannelItem = props => {
  const { channel, createHref, subscribe } = props;
  return (
    <div className="media">
      <div className="media-left">
        <a href="#">
          <img className="media-object"
               height={60}
               width={60}
               src={channel.image}
               alt={channel.title} />
        </a>
      </div>
      <div className="media-body">
        <h4 className="media-heading"><a href={createHref("/podcasts/channel/" + channel.id + "/")}>{channel.title}</a></h4>
        <Grid>
          <Row>
            <Col xs={6} md={9}>
              <Well>{channel.description}</Well>
            </Col>
            <Col xs={6} md={3}>
              <ButtonGroup>
                <Button title={channel.isSubscribed ? "Unsubscribe" : "Subscribe"} onClick={subscribe}>
                  <Glyphicon glyph={channel.isSubscribed ? "trash" : "ok"} /> {channel.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Grid>
      </div>
    </div>
  );
};


export class Search extends React.Component {

  constructor(props) {
    super(props);
    const { search } = bindActionCreators(actions.search, this.props.dispatch);
    this.search = search;
  }

  componentDidMount() {
    const query = this.props.location.query.q || "";
    this.search(query);
  }

  handleSearch(event) {
    event.preventDefault();
    const value = this.refs.query.getValue();
    if (value) {
      this.search(value);
    }
  }

  handleFocus(event) {
    this.refs.query.getInputDOMNode().select();
  }

  render() {

    const { dispatch, channels, podcasts, searchQuery } = this.props;
    const { createHref } = this.props.history;

    return (
    <div>
      <form className="form" onSubmit={this.handleSearch.bind(this)}>

        <Input type="search"
               ref="query"
               onClick={this.handleFocus.bind(this)}
               placeholder="Find a channel or podcast" />
        <Button type="submit" bsStyle="primary" className="form-control">
          <Glyphicon glyph="search" /> Search
        </Button>
      </form>
      {channels.map(channel => {
        const subscribe = (event) => {
          event.preventDefault();
          const action = channel.isSubscribed ? actions.subscribe.unsubscribe : actions.subscribe.subscribe;
          dispatch(action(channel.id, channel.title));
        };
        return (
          <ChannelItem key={channel.id}
                       channel={channel}
                       subscribe={subscribe}
                       createHref={createHref} />
        );
      })}
      {podcasts.length > 0 ? <hr /> : ''}
      {searchQuery ?
        <PodcastList actions={actions}
                   showChannel={true}
                   {...this.props} /> : '' }
    </div>
    );
  }
}

const mapStateToProps = state => {
  const { podcasts, showDetail, isLoading } = state.podcasts;
  const { query, channels } = state.search;
  return {
    searchQuery: query,
    podcasts: podcasts || [],
    channels: channels || [],
    showDetail,
    isLoading,
    player: state.player
  };
};

export default connect(mapStateToProps)(Search);
