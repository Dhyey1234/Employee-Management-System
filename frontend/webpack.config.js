import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './jsx/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'App.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
  },
  {
    test: /\.css$/,            
    use: ['style-loader', 'css-loader']
  }
]
      },
  
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'development',

 
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    port: 3000, 
    open: true,
  },
};

// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   entry: './jsx/index.js',
//   output: {
//     path: path.resolve(__dirname, 'public'),
//     filename: 'App.js'
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader'
//         }
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.js', '.jsx']
//   },
//   mode: 'development'
// };
