/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';

import Notifications from './components/NotificationsUI';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App: () => Node = () => {
  return <Notifications />;
};

export default App;
