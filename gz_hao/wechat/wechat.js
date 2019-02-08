/*
   获取access_token:
   是什么？微信调用接口全局唯一凭据

   特点：
    1.唯一的
    2.有效期为2小时，提前5分钟请求
    3.接口权限 每天2000次

    请求地址：
      https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    请求方式
      GET

      设计思路
      1.首次本地没有，发送请求获取
      2.第二次或以后：
        - 先去本地读取文件，判断它是否过期
         - 过期了
          - 重新请求获取access_token,保存下来覆盖之前文件（保证文件是唯一的）
          -没有过期
           - 直接使用

       整理思路：
          读取本地文件 （readAccessToken）
            - 本地有文件
             - 判断它是否过期( isValidAccessToken )
               - 过期了
                 - 重新请求获取access_token( getAccessToken),保存下来覆盖之前的文件（保存文件是唯一的）(saveAccessToken)
               - 没有过期
                 - 直接使用
            - 本地没有文件
              - 发送请求获取access_token( getAccessToken),保存下来（本地文件）(saveAccessToken), 直接使用
 */
//只需要引入request-promise-navtive
const rp = require('request-promise-native');
const request = require('request');
//fs模块
const {createReadStream, createWriteStream} = require('fs');
//path模块
const {resolve, join} = require('path');

//引入config模块
const {appID, appsecret} = require('../config');
//引入menu模块
const menu = require('./menu');
//引入api摸版
const api = require('../utils/api');
//引入工具函数
const {writeFileAsync,readFileAsync} = require('../utils/tool');

//定义类，获取access_token
class Wechat {
    constructor ( ){
    }

    /**
     * 用来获取access_token
     *
     */
    getAccessToken (){
        //定义请求的地址
        const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;
       //发送请求
        /*
           request
           request-promise-native 返回值是一个promise对象
         */
        return new Promise((resolve, reject) =>{
            rp({method: 'GET',url, json: true})
                .then(res =>{
                    console.log(res);
                    /*
                    { access_token:'16_fgZQuTEe-ByryahUQrjNBtHJvnHmcyG2pneRnBfijT9P39ZMkl7ZYDp3TEwSyF8U7IrhWEBwKv3G_vA37r8-Txx7_3vc9coCFCi7vBFcjfsL5JYGszdTT7N3SSASTFeADAHIU',
  expires_in: 7200 }
                    */
                    //设置access_token的过期时间
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    //将promise对象状态改成成功的状态
                    resolve(res);
                })
                .catch(err => {
                    console.log(err);
                    //将promise对象状态改成失败的状态
                    reject('getAccessToken方法出了问题：' + err);
                })
        })

    }

    /**
     * 用来保存access_token
     * @param accessToken 要保存的凭据
     */
    saveAccessToken (accessToken) {
        return writeFileAsync(accessToken, 'access_token.txt');
    }


    /**
     * 用来读取access_token
     * @param accessToken 要保存的凭据
     */
    readAccessToken () {
       return readFileAsync('ticket.txt');
    }

    /**
     * 用来检测access_token是否有效的
     * @param data
     */
    isValidAccessToken(data){
        //检测传入的参数是否有效的
        if(!data && !data.access_token && !data.expires_in) {
            //代表access_token 无效的
            return false;
        }

        //检测access_token是否在有效期内
        /*if(data.expires_in < Date.now()){
            //过期了
            return false;
        }else {
            //没有过期
            return true;
        }*/

        return data.expires_in > Date.now();

    }

    /**
     * 用来获取没有过期的access_token
     * @param {Promise<any>} access_token
     */
    fetchAccessToken () {
        //优化
        if(this.access_token && this.expires_in && this.isValidAccessToken(this)) {
             // 说明之前保存过access_token,并且它是有效的,直接使用
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            })
        }
        //是fetchAccessToken函数的返回值
         return this.readAccessToken()
         .then(async res => {
             //本地有文件
             //判断它是否过期
             if (this.isValidAccessToken(res)){
                 //有效的
                 return Promise.resolve(res);
                 //resolve(res);
             } else {
                 //过期了
                 //发丝请求获取access_token(getAccessToken),
                const res = await this.getAccessToken();
                //保存下来（本地文件）（saveAccessToken）
                 await this.saveAccessToken(res);
                 //将请求回来的access_token返回去
                 return Promise.resolve(res);
                 //resolve(res);
             }
         })
         .catch(async err => {
             //本地没有文件
             //发丝请求获取access_token(getAccessToken),
             const res = await this.getAccessToken();
             //保存下来（本地文件）（saveAccessToken）
             await this.saveAccessToken(res);
             //将请求回来的access_token返回去
             return Promise.resolve(res);
             //resolve(res);
         })
         .then(res =>{
             //将access_token挂载到this上
             this.access_token = res.access_token;
             this.expires_in = res.expires_in;
             //返回res包装了一层promise对象（此对象为成功的状态）
             //是this.readAccessToken()最终的返回值
             return Promise.resolve(res);
         })
    }


    /**
     * 用来获取jsapi_ticket
     */
    getTicket (){

        //发送请求
        return new Promise(async (resolve, reject) =>{
            //获取access_token
            const data = await this.fetchAccessToken();
            //定义请求的地址
            const url = `${api.tictet}&access_token=${data.access_token}`;

            rp({method: 'GET',url, json: true})
                .then(res =>{
                    //将promise对象状态改成成功的状态
                    resolve({
                        ticket: res.ticket,
                        expires_in: Date.now() + (res.expires_in - 300) * 1000
                    });
                })
                .catch(err => {
                    console.log(err);
                    //将promise对象状态改成失败的状态
                    reject('getAccessToken方法出了问题：' + err);
                })
        })

    }

    /**
     * 用来保存jsapi_ticket
     * @param ticket 要保存的票据
     */
    saveTicket (ticket) {
        return writeFileAsync(ticket, 'ticket.txt');
    }

    /**
     * 用来读取ticket
     */
    readTicket () {
        return readFileAsync('ticket.txt');
    }

    /**
     * 用来检测ticket否有效的
     * @param data
     */
    isValidTicket(data){
        //检测传入的参数是否有效的
        if(!data && !data.ticket && !data.expires_in) {
            //代表ticket 无效的
            return false;
        }
        return data.expires_in > Date.now();

    }

    /**
     * 用来获取没有过期的ticket
     * @param {Promise<any>} ticket
     */
    fetchTicket () {
        //优化
        if(this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
            // 说明之前保存过ticket,并且它是有效的,直接使用
            return Promise.resolve({
                ticket: this.ticket,
                expires_in: this.expires_in
            })
        }

        return this.readTicket()
            .then(async res => {
                //本地有文件
                //判断它是否过期
                if (this.isValidTicket(res)){
                    //有效的
                    return Promise.resolve(res);
                } else {
                    //过期了
                    const res = await this.getTicket();
                    await this.saveTicket(res);
                    return Promise.resolve(res);
                }
            })
            .catch(async err => {
                //本地没有文件
                const res = await this.getTicket();
                await this.saveTicket(res);
                return Promise.resolve(res);
            })
            .then(res =>{
                //将ticket挂载到this上
                this.ticket = res.ticket;
                this.ticket_expires_in = res.expires_in;
                //返回res包装了一层promise对象（此对象为成功的状态）
                //是this.readAccessToken()最终的返回值
                return Promise.resolve(res);
            })
    }


    /**
     * 用来创建自定义菜单
     * @param menu
     * @returns {Promise<any>}
     */
    createMenu (menu) {
        return new Promise(async (resolve, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken();
                //定义请求地址
                const url = `${api.menu.create}access_token=${data.access_token}`;
                //发送请求
                const result = await rp({method: 'POST', url, json: true, body: menu});
                resolve(result);
            } catch (e) {
                reject('createMenu方法出了问题：' + e);
            }
        })
    }

    /**
     * 用来删除自定义菜单的
     * @param menu
     * @returns {Promise<any>}
     */
    deleteMenu (){
         return new Promise(async (resolve, reject) => {
             try {
                 //获取access_token
                 const data = await this.fetchAccessToken();
                 //定义请求地址
                 const url = `${api.menu.delete}access_token=${data.access_token}`;
                 //发送请求
                 const result =await rp({method: 'POST',url, json: true});
                 resolve(result);
             } catch (e) {
                 reject('deleteMenu方法出了问题：' + e);
             }
         })
    }

    //上传临时素材
    uploadTemporaryMaterial (type, fileName) {
        //获取文件的绝对路径
        const filePath = resolve(__dirname, '../media', fileName);

        return new Promise(async (resolve, reject) => {

            try {  //放置可能出错的代码
                //获取access_token
                const data = await this.fetchAccessToken();
                //定义请求
                const url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`;

                const formData = {
                    media: createReadStream(filePath)
                }
                //以form表单的方式发送请求
                const result = rp({method: 'POST', url, json: true, formData});
                //将数据返回给用户
                resolve(result);
            } catch (e) {
                //一旦try中的代码出了问题，就会走catch逻辑，处理错误
                reject('uploadTemporaryMaterial方法除了问题：' + e);
            }

        })
    }
    //获取临时素材
    getTemporaryMaterial (type, mediaId, fileName){
        //获取文件的绝对路径
        const filePath = resolve(__dirname, '../media', fileName);

        return new Promise(async (resolve, reject) => {
            //获取access_token
            const data = await this.fetchAccessToken();
            //定义请求地址
            let url = `${api.temporary.get}access_token=${data.access_token}&media_id=${mediaId}`;
            //判断是否视频文件
            if (type === 'video'){
                //视频文件只支持http协议
                url = url.replace('https://', 'http://');
                //发送请求
                const data = await rp({method: 'GET', url, json: true});
                //返回出去
                resolve(data);
            } else {
               //其他类型文件
                request(url)
                    .pipe(createWriteStream(filePath))
                    .once('close', resolve) //当文件读取完毕时，可读流会自动关闭，一旦关闭触发close，从而调用resolve方法通知外部文件读取完毕了
            }
        })
    }

    //上传永久素材
    uploadPermanentMaterial (type, material, body){

       return new Promise((resolve, reject) => {
          try {
              //获取access_token
             const data = await this.fetchAccessToken();
             //请求得配置对象
             let options = {
                method: 'POST',
                json: true
             }
             
             if (type === 'news') {
                 //上传图文消息
                 options.url = `${api.permanment.uploadNews}access_token=${data.access_token}`;
                 options.body = material;
             } else if (type === '') {
                 //上传图文消息中的图片
                 options.url = `${api.permanment.uploadImg}access_token=${data.access_token}`;
                 options.formData = {
                     media: createReadStream(join(__dirname, '../media', material))
                 }
             } else {
                 //其他媒体素材的上传
                 options.url = `${api.permanment.uploadImg}access_token=${data.access_token}&type=${type}`;
                 options.formData = {
                    media: createReadStream(join(__dirname, '../media', material))
                 }
                 //视频素材，需要多提交一个表单
                 if (type === 'video') {
                     options.body = body;
                 }
             }
             
             //发送请求
             const result = await rp(options);
             //将返回值返回出去
             resolve(result);
          } catch (e) {
             reject('uploadPermanentMaterial方法出了问题' + e);
          }

       })
    }
}

(async () => {
    //模拟测试
    const w = new Wechat();
    //删除之前定义的菜单
    let result = await w.deleteMenu();
    console.log(result);
    //创建新的菜单
   result = await w.createMenu(menu);
   console.log(result);
    // const  data = await w.fetchTicket();
    // console.log(data);
})()


module.exports = Wechat;