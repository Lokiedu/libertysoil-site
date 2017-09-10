import React from 'react';

import { Welcome as DisconnectedWelcome } from '../../../../pages/welcome';
import props from './defaultProps';


const Welcome = () => (<DisconnectedWelcome {...props} />);

export default Welcome;
