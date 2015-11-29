#!/usr/bin/env babel-node
import request from 'superagent';
import AdmZip from 'adm-zip';
import tmp from 'tmp';
import fs from 'fs';
import http from 'http';

async function countries() {
  let req = await request.get('http://download.geonames.org/export/dump/countryInfo.txt');

  let content_lines = req.text.split("\n");

  content_lines.pop();

  let countries_data = content_lines.slice(51).map((line) => {
    let country_fields = line.split("\t");
    try {
      country_fields.map((field, index) => {
        if(index === 15 || index === 17) {
          country_fields[index] = `'${JSON.stringify(field.split(','))}'`;
        } else if(!field.match(/^\d+$/)) {
          field = field.replace(/'/g, "''");
          country_fields[index] = `'${field}'`;
        }
      });

      country_fields.splice(16, 1);
      country_fields.pop();
      return country_fields;
    } catch (ex) {
      return [];
    }

  });

  countries_data.map((row) => {
    console.log(`INSERT INTO geonames_countries VALUES (${row.join(',')});`);
  });

}

function cities() {
  let tmp_file = tmp.fileSync();

  let output = fs.createWriteStream(tmp_file.name);

  output.on('finish', function () {
    let zip = new AdmZip(tmp_file.name);

    let content_lines = zip.readAsText("cities1000.txt").split("\n");

    let cities_data = content_lines/*.slice(0, 100)*/.map((line) => {
      let city_fields = line.split("\t");
      try {
        city_fields.map((field, index) => {
          field = field.replace(/'/g, "''");
          if(index === 3) {
            city_fields[index] = `'${JSON.stringify(field.split(','))}'`;
          } else if(!field.match(/^\d+$/)) {
            city_fields[index] = `'${field}'`;
          }
        });

        return city_fields;
      } catch (ex) {
        return [];
      }

    });

    cities_data.map((row) => {
      console.log(`INSERT INTO geonames_cities VALUES (${row.join(',')});`);
    });
  });

  request.get('http://download.geonames.org/export/dump/cities1000.zip').pipe(output);
}

//countries().catch(e => { console.error(e); });
//cities();
