import fetch from 'node-fetch';


/**
 * Turns headers and lines into an array of objects.
 * @param {Array} headers - An array of headers ['header1', 'header2']
 * @param {Array} lines - [['val1', 2], ['val2', 2]]
 * @return {Array} - [{header1: 'val1', header2: 2}, {header1: 'val2', header2: 2}]
 */
function mapLinesToObjects(headers, lines) {
  return lines.map(line => {
    return headers.reduce((acc, header, index) => {
      acc[header] = line[index];
      return acc;
    }, {});
  });
}

export async function getGeocodeCountries() {
  const response = await fetch('http://opengeocode.org/download/cow.txt');
  const text = await response.text();

  const lines = text
    .split('\r\n')
    .filter(line => {
      line = line.trim();
      return line.length && line[0] != '#';
    });

  const headers = lines[0].split(';');
  const objectLines = lines
    .slice(1)
    .map(line => line.split('; '));

  return mapLinesToObjects(headers, objectLines);
}

export async function getGeocodeAdminDivisions() {
  const headers = [
    'ISO3166A2', 'bgnlc_name', 'bgnlc_ro_name', 'bgnlc_variant', 'bgnlc_formalname', 'bgnlc_formalproper',
    'lang', 'bgnlc_oth_name', 'bgnlc_oth_ro_name', 'bgnlc_oth_variant', 'bgnlc_oth_formalname', 'bgnlc_oth_formalproper',
    'admin1_type', 'ISO31662A2', 'FIPS52', 'gns', 'csgi', 'lc_capital', 'lc_ro_capital', 'capital_latitude',
    'capital_longitude', 'postal_prefix_min', 'postal_prefix_max', 'population', 'housing', 'population-Year',
    'land', 'latitude', 'longitude', 'government_website', 'country_name'
  ];

  const response = await fetch('http://opengeocode.org/download/cow-na1.txt');
  const text = await response.text();

  const objectLines = text
    .split('\r\n')
    .filter(line => {
      line = line.trim();
      return line.length && line[0] != '#';
    })
    .map(line => line.split('; '));

  return mapLinesToObjects(headers, objectLines);
}
