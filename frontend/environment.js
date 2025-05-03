if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
  }

let IS_PROD = false;

const server = IS_PROD ? process.env.backendServer : "http://localhost:8080";

export default server;