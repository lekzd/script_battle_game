# Script Battle Game

[Presentation video](https://youtu.be/LfgaRFnmkhk)

## Local launch

1. `npm run start`
2. `npm run server`
3. open `localhost:8080/public` in browser

## How to make your own server

### 1: `src/common/Environment.ts`

Edit constants below:

`PROD_URL` - http(s) server URL;

`PROD_WS_URL` - ws(s) server URL;

### 2: `.env file`

Create `.data` directory in root
Create file `.env` with data:
```
ADMIN_PASSWORD=admin
```
you can set any admin password to access admin panel to create new rooms

### 3: `package.json` (optional)

Edit script `deploy` from `scripts` section 
to make your own deploy command for your server

### 4: `npm run release`

makes archive to deploy on server

### 5: launch server

Use [ts-node](https://www.npmjs.com/package/ts-node) or [PM2](http://pm2.keymetrics.io/) to launch `./server/index.ts` file
