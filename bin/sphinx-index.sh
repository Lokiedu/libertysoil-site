#!/usr/bin/env bash
# Sphinx's searchd should be running for this to work

indexer -c ../sphinx.conf --all --rotate

mysql -h0 -P9306 << SQL
ATTACH INDEX Geotags TO RTINDEX GeotagsRT;
ATTACH INDEX Hashtags TO RTINDEX HashtagsRT;
ATTACH INDEX Posts TO RTINDEX PostsRT;
ATTACH INDEX Users TO RTINDEX UsersRT;
ATTACH INDEX Schools TO RTINDEX SchoolsRT;
ATTACH INDEX Comments TO RTINDEX CommentsRT;
SQL
