const Koa = require('koa');
const app = new Koa();

const route = require('koa-route');
const koaBody = require('koa-body');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// 导入mongoose.js
const mongoose = require('./mongoose');

// 密钥
const secretKey = "mrkleoBlogSecretKey";

const log4js = require("log4js");
const CONFIG = require('./config/config');
log4js.configure(CONFIG.LOG_CONFIG);

const reslogger = log4js.getLogger("response");
const errorlogger = log4js.getLogger("error");

var cors = require('koa2-cors');
app.use(cors());

/* 
    日志携带不同参数
*/
const logStrFn = function (...arg) {
    return arg.join(' ');
}

const home = async ctx => {
    // 请求获取首页数据

};

// 判断用户登录状态
const checkUserStatus = async (ctx,next) => {
    /* 
        先通过token判断用户权限
    */
    let isJuris = await beforeRequestOtherApi(ctx, next);
    if (!isJuris.isJuris) {
        ctx.body = {
            message: '还未登录或登录过期',
            status: 401
        }
        return;
    }
    // 如果已经是登录状态, 获取用户信息
    let userId = isJuris.user.userId;
    let user = await mongoose.checkUser(userId).catch(err => {
        console.log(err);
    });
    ctx.body = {
        message: '用户已经是登录状态',
        status: 200,
        user
    }
};
// 用户登录
const userLogin = async ctx => {
    // 获取请求的用户名和密码
    const body = ctx.request.body;
    let res = await mongoose.userLogin(body.email, body.password);
    // 未找到对应用户
    if (!res) {
        ctx.body = {
            message: '用户名或密码错误',
            status: 404
        };
        reslogger.info(logStrFn(ctx.request.url, ctx.request.method, "用户名或密码错误"));
        return;
    }
    // 整理打包需要存储的信息
    let jwtSaveData = {
        userId: res._id,
        // 权限
        userAuth: res.userAuth
    }
    // jwt签发token
    let token = jwt.sign({
        // token过期时间
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: jwtSaveData
    }, secretKey);
    // 返回token
    ctx.body = {
        message: '登录成功',
        status: 200,
        userInfo: res,
        token
    }
};
// 用户注册
const userRegister = async ctx => {
    let body;
    if (ctx.request.body) {
        // 获取请求的数据
        body = ctx.request.body;
    }
    try {
        await mongoose.userRegister(body);
    } catch (error) {
        console.log(error)
        ctx.body = {
            message: '未知错误',
            status: 500
        }
        reslogger.info(logStrFn(ctx.request.url, ctx.request.method, "用户名或密码错误"));
        return;
    }
    ctx.body = {
        message: '注册成功',
        status: 200
    }
};
// 修改用户信息
const userInfoUpdate = async ctx => {
    let body;
    if (ctx.request.body) {
        // 获取请求的数据
        body = ctx.request.body;
    }
    // 查询是否存在该用户
    let isExistUser = await mongoose.checkUser(body.profileId).catch(err => {
        // 找到异常, 但是不会直接让程序死掉
        console.log(err);
    });
    if (!isExistUser) {
        ctx.body = {
            message: '用户不存在',
            status: 404
        }
        return;
    }
    try {
        await mongoose.updateUserInfo(body);
    } catch (error) {
        console.log(error)
        ctx.body = {
            message: '未知错误',
            status: 500
        }
        return;
    }
    ctx.body = {
        message: '用户信息更新成功',
        status: 200
    }
};

/* 
    文章的增删改查
*/
// 获取某一篇文章
const findOneArticle = async ctx => {
    // 获取文章id
    let article_id = ctx.request.querystring.split('=')[1];
    let artObj = null;
    try {
        // 首先查询是否存在该文章
        artObj = await mongoose.findOneArticle(article_id);
    } catch (error) {
        ctx.body = status404;
        return;
    }
    ctx.body = {
        data: artObj,
        statu: 200
    }
}
// 获取所有文章
const findAllArticle = async ctx => {
    let blogList = null;
    try {
        blogList = await mongoose.findAllArticle();
    } catch (error) {
        ctx.body = status404;
        return;
    }
    ctx.body = {
        data: blogList,
        statu: 200
    }
}
// 添加文章
const addOneArticle = async (ctx, next) => {
    /* 
        先通过token判断用户权限
    */
    let isJuris = await beforeRequestOtherApi(ctx, next);
    if (!isJuris.isJuris) {
        ctx.body = {
            message: '对不起,验证权限不通过',
            status: 403
        }
        return;
    }

    const articleObj = ctx.request.body;
    let res = null;
    try {
        res = await mongoose.addArticle(articleObj);
    } catch (error) {
        ctx.body = {
            message: '文章添加失败',
            status: 500
        }
        return;
    }
    ctx.body = {
        message: '文章添加成功',
        status: 200,
        articleId: res._id
    }
}
// 修改文章
const updateOneArticle = async (ctx, next) => {
    /* 
        先通过token判断用户权限
    */
    let isJuris = await beforeRequestOtherApi(ctx, next);
    if (!isJuris.isJuris) {
        ctx.body = {
            message: '对不起,验证权限不通过',
            status: 403
        }
        return;
    }

    const articleObj = ctx.request.body;
    let article_id = null;
    if (articleObj.articleId) {
        // 先获取文章id
        article_id = articleObj.articleId;
        // 剥离articleId
        delete articleObj.articleId;
    } else {
        ctx.body = {
            message: 'articleId(文章id)参数没有携带',
            status: 404
        }
        return;
    }
    try {
        await mongoose.updateArticle(article_id, articleObj);
    } catch (error) {
        ctx.body = {
            message: '文章更新失败',
            status: 500
        }
        return;
    }
    ctx.body = {
        message: '文章更新成功',
        status: 200
    }
}
// 删除文章
const deleteOneArticle = async (ctx, next) => {
    /* 
        先通过token判断用户权限
    */
    let isJuris = await beforeRequestOtherApi(ctx, next);
    if (!isJuris.isJuris) {
        ctx.body = {
            message: '对不起,权限验证不通过',
            status: 403
        }
        return;
    }

    const requestObj = ctx.request.body;
    if (!requestObj.articleId) {
        ctx.body = {
            message: '未携带articleId(文章id)参数',
            status: 404
        }
        return;
    }
    // 获取文章id
    let article_id = requestObj.articleId;
    let delRes = null;
    try {
        delRes = await mongoose.deleteArticle(article_id);
    } catch (error) {
        ctx.body = {
            message: '删除文章失败,请保证要删除的文章id是正确的',
            status: 400
        }
        return;
    }
    if (delRes && delRes.deletedCount == 1) {
        ctx.body = {
            message: '文章删除成功',
            status: 200
        }
    } else if (delRes && delRes.deletedCount == 0) {
        ctx.body = {
            message: '文章已经删除, 请勿重复删除',
            status: 200
        }
    }
}

// 执行涉及增删改其他接口前,判断用户权限
const beforeRequestOtherApi = async (ctx, next) => {
    var decoded = null;
    var isJuris = false;
    try {
        // 参数放在请求体中,后期要修改为请求头中
        let token = ctx.request.header.authorization;
        // 捕获无效签名token
        decoded = jwt.verify(token, secretKey);
        isJuris = decoded.data.userAuth;
        // 用户没有权限
        if (isJuris == false) {
            return {
                isJuris
            };
        }
    } catch (error) {
        return {
            isJuris
        };
    }
    return {
        isJuris,
        user: decoded.data
    };
}
// 404状态
const status404 = {
    data: null,
    status: 404,
}

app.use(koaBody());
// 首页
app.use(route.get('/home', home));
// 判断用户登录状态
app.use(route.get('/checkstatus', checkUserStatus));
// 用户登录
app.use(route.post('/login', userLogin));
// 用户注册
app.use(route.post('/register', userRegister));
// 修改用户信息
app.use(route.post('/updateuserinfo', userInfoUpdate));

/* 
    文章的增删改查
*/
// 获取某一篇文章
app.use(route.get('/article/query', findOneArticle));
// 获取所有文章
app.use(route.get('/article/all', findAllArticle));
// 添加文章
app.use(route.post('/article/add', addOneArticle));
// 修改文章
app.use(route.post('/article/update', updateOneArticle));
// 删除文章
app.use(route.post('/article/delete', deleteOneArticle));


app.listen(3000);