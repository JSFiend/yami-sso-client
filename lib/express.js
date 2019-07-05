// 第三方登录相关
const request = require('request-promise-any');
const _ = require('lodash');
const url = require('url');

module.exports = function (loginConf) {
  try {
    const cookieDomainConfig = {
      domain: loginConf.cookieDomain || '', // 用户cookie域
    };
    const cookieConfig = Object.assign({
      maxAge: 365 * 24 * 60 * 60 * 1000, // 用户cookie过期时间为1年
    }, cookieDomainConfig);

    return async (req, res, next) => {
      if (req.path === '/logout') {
        res.cookie(loginConf.ticketCookieName || 'ticket', null, cookieDomainConfig);
        res.cookie(loginConf.uidCookieName || 'uid', null, cookieDomainConfig);
        toLogoutPage(req, res);
      } else if (!loginConf.enableLogin) {
        res.uid = loginConf.defaultLoginUid || '';
        await next();
      } else if (isInPath(req, loginConf.ignore || []) || isInIgnoreIps(req, loginConf.ignoreIps || [])) {
        // 跳过用户配置的不需要验证的url或白名单IP
        res.uid = req.query.uid || loginConf.defaultLoginUid;
        await next();
      } else {
        let ticket; let
          uid;
        const ticketFromQuery = req.query[loginConf.ticketParamName || 'ticket'];
        if (ticket = ticketFromQuery) {
          uid = await getUid(req, res, ticket);
          if (uid) {
            res.cookie(loginConf.ticketCookieName || 'ticket', ticket, cookieConfig);
            res.cookie(loginConf.uidCookieName || 'uid', uid, cookieConfig);
          }
        }
        if (!uid) {
          uid = req.cookies[loginConf.uidCookieName || 'uid'];
        }
        if (!ticket) {
          ticket = req.cookies[loginConf.ticketCookieName || 'ticket'];
        }
        if (await validate(req, res, uid, ticket)) {
          res.uid = uid;
          if (ticketFromQuery) {
            const urlObj = url.parse(req.url, true);
            delete (urlObj.query[loginConf.ticketParamName || 'ticket']);
            delete (urlObj.search);
            const redirectUrl = url.format(urlObj);
            res.redirect(redirectUrl);
          } else {
            await next();
          }
        } else if (isInPath(req, loginConf.apiPrefix)) {
          res.json({ ret_code: 500, err_msg: loginConf.apiNotLoginMes, data: {} });
        } else {
          toLoginPage(req, res);
        }
      }
    };


    // 检测是否在path列表中
    function isInPath(req, pathList) {
      const pathname = req.path;
      const index = _.findIndex(pathList, (rule) => {
        if (!rule) {
          return false;
        } if (typeof rule === 'string') {
          return pathname.indexOf(rule) === 0;
        } if (rule instanceof RegExp) {
          return rule.test(pathname);
        }
      });
      return index > -1;
    }

    // 检测是否在IP白名单之中
    function isInIgnoreIps(req, ignoreIps) {
      const { ip } = req;
      return _.indexOf(ignoreIps || [], ip) > -1;
    }

    // 控制跳转到登录页面
    async function toLoginPage(req, res) {
      if (loginConf.loginUrl.indexOf('?') === -1) {
        res.redirect(`${loginConf.loginUrl}?${loginConf.redirectUrlParamName}=${encodeURIComponent(`${req.protocol}://${req.headers.host}${req.url}`)}`);
      } else {
        res.redirect(`${loginConf.loginUrl}&${loginConf.redirectUrlParamName}=${encodeURIComponent(`${req.protocol}://${req.headers.host}${req.url}`)}`);
      }
    }

    // 控制跳转到登出页面
    async function toLogoutPage(req, res) {
      if (loginConf.logoutUrl) {
        if (loginConf.logoutUrl.indexOf('?') === -1) {
          res.redirect(`${loginConf.logoutUrl}?${loginConf.logoutredirectUrlParamName}=${encodeURIComponent(`${req.protocol}://${req.host}`)}`);
        }else{
          res.redirect(`${loginConf.logoutUrl}&?${loginConf.logoutredirectUrlParamName}=${encodeURIComponent(`${req.protocol}://${req.host}`)}`);
        }
       } else {
        res.redirect(`${req.protocol}://${req.host}`);
      }
    }

    // 通过ticket获取用户信息
    async function getUid(req, res, ticket) {
      try {
        if (loginConf.getUidByTicket) {
          if (_.isFunction(loginConf.getUidByTicket)) {
            return await loginConf.getUidByTicket(req, res, ticket);
          }
          let uidInfo;
          if(loginConf.getUidByTicket.indexOf('?') === -1) {
            uidInfo = await request.get(`${loginConf.getUidByTicket}?${loginConf.getUidByTicketParamName}=${ticket}`);
          }
          else{
            uidInfo = await request.get(`${loginConf.getUidByTicket}&${loginConf.getUidByTicketParamName}=${ticket}`);
          }
          try {
            uidInfo = JSON.parse(uidInfo);
          } catch (e) {
            uidInfo = false;
          }
          if (!uidInfo) return false;
          return _.result(uidInfo, loginConf.uidKey) || false;
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    // 判断是否ticket和uid是否有效
    async function validate(req, res, uid, ticket) {
      try {
        if (loginConf.validate) { // 如果没有配置校验接口，则表示此用户名直接有效直到过期
          if (_.isFunction(loginConf.validate)) {
            return await loginConf.validate(req, res, uid, ticket);
          }
          let validateRet;
          if(loginConf.validate.indexOf('?') === -1) {
            validateRet = await request.get(`${loginConf.validate}?${loginConf.validateTicketParamName}=${ticket}&${loginConf.validateUidParamName}=${uid}`);
          }
          else{
             validateRet = await request.get(`${loginConf.validate}&${loginConf.validateTicketParamName}=${ticket}&${loginConf.validateUidParamName}=${uid}`);
          }
          try {
            validateRet = JSON.parse(validateRet);
          } catch (e) {
            validateRet = false;
          }
          if (!validateRet) return false;
          const { validateMatch } = loginConf;
          for (let i = 0; i < validateMatch.length; i++) {
            if (_.result(validateRet, validateMatch[i][0]) !== validateMatch[i][1]) {
              return false;
            }
          }
          return true;
        }
        return true;
      } catch (e) {
        throw (e);
        return false;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
