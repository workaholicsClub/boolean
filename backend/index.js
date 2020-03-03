const Koa = require('koa');
const Router = require('@koa/router');
const json = require('koa-json');
const koaBody = require('koa-body');


const searchEndpoint = require('./endpoints/search');

let app = new Koa();
let router = new Router();

router.post('/api/search', koaBody(), searchEndpoint);

app
    .use(json())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);