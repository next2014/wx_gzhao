/*
  所有api地址
 */

//地址前缀
const prefix = 'https://api.weixin.qq.com/cgi-bin/';

module.exports = {
    accessToken: `${prefix}token?grant_type=client_credential`,
    tictet: `${prefix}ticket/getticket?type=jsapi`,
    menu: {
        create: `${prefix}menu/create?`,
        delete: `${prefix}menu/delete?`
    },
    temporary: {
        upload: `${prefix}/media/upload?`,
        get: `${prefix}/media/get?`
    },
    Permanment: {
        uploadNews: `${prefix}material/add_news?`,
        uploadImg: `${prefix}media/uploadimg?`,
        uploadOthers: `${prefix}material/add_material?`
    }
}