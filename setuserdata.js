//该文件用于初始化用户的所有数据
//1.导包
const hm = require("mysql-ithm")

//3.连接数据库
//如果数据库存在则连接，不存在则会自动创建数据库
hm.connect({
    host: 'localhost',//数据库地址
    port: '3306',
    user: 'root',//用户名，没有可不填
    password: 'root',//密码，没有可不填
    database: 'heromanger'//数据库名称
});

//用户账号密码的表单
let userModel = hm.model('userlist', {
    name: String,
    password: String,
});
var user_arr = [{ name: "admin", password: "123456" },{name:"jason",password:"chx123456"},{name:"jack",password:"654123"}];
// 
userModel.insert(user_arr, (err, results) => {
    console.log(err);
    console.log(results);
    if (!err) console.log('增加成功');
});
 