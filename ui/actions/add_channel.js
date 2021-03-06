import * as alerts from './alerts';
import { routeActions } from 'redux-simple-router';
import { Actions } from '../constants';
import { createAction } from './utils';

export const open = () => createAction(Actions.OPEN_ADD_CHANNEL_FORM);
export const close = () => createAction(Actions.CLOSE_ADD_CHANNEL_FORM);

export function complete(channel) {
  return dispatch => {
    dispatch(alerts.success(`You are now subscribed to "${channel.title}"`));
    dispatch(createAction(Actions.ADD_CHANNEL_SUCCESS, channel));
    dispatch(routeActions.push(`/channel/${channel.id}/`));
  };
}
