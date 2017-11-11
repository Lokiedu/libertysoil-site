import values from 'lodash/values';
import PropTypes from 'prop-types';

import { MediaTargets } from '../consts/media';

export const MediaTarget = PropTypes.oneOf(values(MediaTargets));
