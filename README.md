# yami-sso-client
[![npm](https://img.shields.io/npm/v/yami-sso-client.svg)](https://www.npmjs.com/package/yami-sso-client)
[![Build Status](https://travis-ci.org/JSFiend/yami-sso-client.svg?branch=master)](https://travis-ci.org/JSFiend/yami-sso-client)

简单可拓展的单点登录客户端中间件，支持koa2或express

## nodejs版本要求
要求nodejs 7.6版本以上，需支持async/await

## 安装
`npm install yami-sso-client`

## 调用方法
var loginMiddware = requrire('yami-sso-client').koa

var loginConf = {
			//配置参考“配置参数”
};

app.use(loginMiddware(loginConf));

## 配置参数
    
	//是否启用登录验证
	enableLogin: true, 
	//若不启用登录验证，默认用户为admin
    defaultLoginUid: 'admin',
	//跳转登录url
    loginUrl: 'http://localhost/login.html',
	//跳转到登录页面url的时带的原url参数名，如：***/login?service=***，默认是service
    redirectUrlParamName: 'service',
	//跳转登出页面
    logoutUrl: '',
	//跳转登出页面带的参数名
    logoutredirectUrlParamName: 'service',
    //cookie中保存ticket信息的cookie名
	ticketCookieName: 'ticket',
	//cookie中保存用户信息的cookie名
    uidCookieName: 'uid',
	//cookie值对应的域
    cookieDomain: 'localhost',
	//第三方登录服务回调时候，url中表示ticket的参数名
    ticketParamName: 'ticket',
	//通过ticket从cas服务端校验和获取用户基本信息的url，此处可以是个函数，koa传入ctx，ticket，express传入req, res, ticket
    getUidByTicket: 'http://localhost/api/getUidByTicket', 
	//调用获取用户信息接口时候ticket的参数名，若getUidByTicket为函数方法，则此参数无效
    getUidByTicketParamName: 'ticket',
	//结果JSON里面取出用户名的位置，取到该用户名才认为成功,可以多层
    uidKey: 'data.uid',
	//通过token和用户名到cas服务端校验key和用户名是否匹配的url，此处也可以是方法，koa传入ctx，ticket，uid，express传入req, res, ticket，uid。直接返回true或false表示结果
    validate: 'http://localhost/api/validate',
	//校验接口传入ticket参数名
    validateTicketParamName: 'ticket',
	//校验接口传入用户id参数名
    validateUidParamName: 'uid',
	//校验通过匹配条件，可以从多层结果，多个情况，满足其中的此对应关系，才通过。若validate为函数，则此参数无效
    validateMatch: [
        ['data.result', true]
    ],
	//不需要登录校验的路径
    ignore: ['/static'], 
	//不需要登录校验的ip白名单
    ignoreIps: [],
	 //接口相应的路径前缀，访问接口若未登录，则返回未登录结果，不跳转到登录页面
    apiPrefix: ['/api'],
	//接口无登录权限的提示语
    apiNotLoginMes: '您尚未登录',
