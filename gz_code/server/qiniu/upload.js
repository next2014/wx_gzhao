//引入qiniu模块
const qiniu = require('qiniu');

const accessKey = 'krjY8O606CXaSRaKNzVAAF3we2EPlA0BJg6ySjgg';
const secretKey = 'XjZb6IodAbYTNnJulNZtPmhaiF5Pi31wrMcAI1WH';
//定义鉴权对象
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
//定义配置对象
const config = new qiniu.conf.Config();
//存储区域   z1  -- 华北
config.zone = qiniu.zone.Zone_z1;
//bucketManager对象上就有所有的方法
const bucketManager = new qiniu.rs.BucketManager(mac, config);
// 存储空间的名称
const bucket = 'atguigu-movie';

module.exports = (resUrl, key) => {
  /*
    resUrl  网络资源的地址
    bucket  存储空间的名称 students
    key     重命名网络资源的名称
   */
  return new Promise((resolve, reject) => {
    bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
      if (err) {
        reject('上传七牛方法出了问题' + err);
      } else {
        if (respInfo.statusCode == 200) {
          console.log('文件上传成功');
          resolve();
        }
      }
    });
  })
}