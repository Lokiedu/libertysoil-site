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
import React, { PropTypes } from 'react';


export default function AlphabetFilter({ alphabet, selectedLetter, onSelect }) {
  const letters = alphabet.map((letter, index) => {
    const handleClick = () => onSelect(letter);
    let className = 'alphabet_filter__letter';
    if (selectedLetter === letter) {
      className += ' alphabet_filter__letter-selected';
    }

    return (
      <a className={className} href="javascript:;" key={index} onClick={handleClick}>{letter}</a>
    );
  });

  return (
    <div className="alphabet_filter">
      {letters}
    </div>
  );
}

AlphabetFilter.propTypes = {
  alphabet: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  selectedLetter: PropTypes.string,
};
