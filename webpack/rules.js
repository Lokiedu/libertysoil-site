import path from 'path';

import ExtractTextPlugin from 'extract-text-webpack-plugin';

import { skipFalsy } from './utils';


class RuleGenerator {
  dev;

  constructor(dev) {
    this.dev = dev;
  }

  /** Embed font in CSS if dev */
  fontLoader = (loaderQuery) => {
    const loaderObject = {};
    loaderObject.query = loaderQuery;
    if (this.dev) {
      loaderObject.loader = 'url-loader';
      loaderObject.query.limit = 150000;
    } else {
      loaderObject.loader = 'file-loader';
    }
    return loaderObject;
  };


  get commmonLess() {
    const loaders = [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          uniqueSelectors: false
        }
      },
      {
        loader: 'postcss-loader'
      },
      {
        loader: "less-loader"
      }
    ];
    return {
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: loaders.map(this.addSourceMap)
      }),
      resource: {
        and: [
          { test: /\.less$/ },
          { include: path.resolve('src/less') },
        ]
      }
    };
  }

  get externalCss() {
    const loaders = [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          uniqueSelectors: false
        }
      },
      {
        loader: 'postcss-loader'
      }
    ];

    return {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: loaders.map(this.addSourceMap)
      })
    };
  }

  get componentsLess() {
    const loaders = [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
          modules: true,
          importLoaders: true,
          localIdentName: '[folder]__[local]___[hash:base64:5]',
          calc: false,
          mergeIdents: false
        }
      },
      {
        loader: 'postcss-loader'
      },
      {
        loader: "less-loader"
      },
    ];

    return {
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: loaders.map(this.addSourceMap)
      }),
      resource: {
        and: [
          { test: /\.less$/ },
          { exclude: path.resolve('src/less') },
        ]
      }
    };
  }

  get images() {
    return {
      test: /\.(png|jpg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name]-[hash].[ext]'
          },
        }
      ],
      exclude: /node_modules|fonts/
    };
  }

  get favicons() {
    return {
      test: /\.ico$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]'
          }
        }
      ]
    };
  }

  get fonts() {
    const outputName = 'assets/fonts/[name]-[hash].[ext]';
    return [
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          this.fontLoader({
            mimetype: 'image/svg+xml',
            name: outputName
          })
        ],
        include: /node_modules\/font-awesome/
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        ...this.fontLoader({
          mimetype: 'application/font-woff',
          name: outputName
        })
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        ...this.fontLoader({
          mimetype: 'application/font-woff2',
          name: outputName
        })
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        ...this.fontLoader(
          {
            mimetype: 'application/x-font-opentype',
            name: outputName
          }
        )
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        ...this.fontLoader({
          mimetype: 'application/x-font-truetype',
          name: outputName
        })
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        ...this.fontLoader({
          mimetype: 'application/vnd.ms-fontobject',
          name: outputName
        })
      }
    ];
  }

  get ejsIndexTemplate() {
    return {
      test: /\/index\.ejs$/,
      use: 'raw-loader'
    };
  }

  get clientJs() {
    return {
      test: /\.js?$/,
      exclude: /(node_modules)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            ignore: /(node_modules)/,
            presets: ["react", ["es2015", { "modules": false }], "stage-1"],
            plugins: skipFalsy([
              ["syntax-do-expressions"],
              ["transform-do-expressions"],
              ["lodash"],
              this.dev && ['transform-runtime'],
              !this.dev && ['transform-react-remove-prop-types'],
              !this.dev && ["transform-react-constant-elements"],
              !this.dev && ["transform-react-inline-elements"],
              this.dev && ["flow-runtime", {
                "annotate": false,
                "assert": true,
                "warn": true
              }],
            ])
          },
        }
      ],
      include: [
        path.resolve('src'),
      ]
    };
  }

  get clientLibFixes() {
    return [
      // Fix grapheme-breaker
      {
        enforce: 'post',
        test: /\.js$/,
        include: /node_modules\/grapheme-breaker/,
        loader: 'transform-loader/cacheable?brfs'
      },
    ];
  }

  get serverJs() {
    return {
      test: /\.js?$/,
      exclude: /(node_modules)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            ignore: /(node_modules)/,
            presets: ["react"],
            plugins: [
              "syntax-class-properties",
              "syntax-do-expressions",
              "syntax-dynamic-import",
              "syntax-object-rest-spread",
              "transform-do-expressions",
              "transform-object-rest-spread",
              "transform-class-properties",
              "lodash",
              this.dev && ["flow-runtime", {
                "annotate": false,
                "assert": true,
                "warn": true
              }],
            ],
          },
        }
      ],
      include: [
        path.resolve('server.js'),
        path.resolve('tasks.js'),
        path.resolve('src'),
      ]
    };
  }

  get htmlForDevRender() {
    return {
      test: /index\.html$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'index.html'
          }
        }
      ],
    };
  }

  addSourceMap = (loader) => {
    return this.dev ? { ...loader, options: { ...loader.options, sourceMap: true } } : loader;
  };
}

export default RuleGenerator;
