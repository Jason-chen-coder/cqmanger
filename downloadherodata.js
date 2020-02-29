//该文件用于下载王者荣耀所有的数据
//1.导包
const express = require("express")
const hm = require("mysql-ithm")
var Crawler = require("crawler");

//2.创建服务器
// const app = express();
let hero_array = [];//用于保存所有英雄信息


//3.连接数据库
//如果数据库存在则连接，不存在则会自动创建数据库
hm.connect({
    host: 'localhost',//数据库地址
    port: '3306',
    user: 'root',//用户名，没有可不填
    password: 'root',//密码，没有可不填
    database: 'heromanger'//数据库名称
});

//4.创建Model(表格模型：负责增删改查)
//英雄列表表单
let heroModel = hm.model('herolist', {
    name: String,
    skill: String,
    icon: String,
    isdelete: String
});

//     //用户账号密码的表单
// let userModel = hm.model('userlist', {
//     name: String,
//     password: String,
// });
// var user_arr = [{ name: "admin", password: "123456" },{name:"jason",password:"chx123456"},{name:"jack",password:"654123"}];

// userModel.insert(user_arr, (err, results) => {
//     console.log(err);
//     console.log(results);
//     if (!err) console.log('用户列表增加成功');
// });


//5.创建爬英雄列表操作
var getherolist = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            // $ is Cheerio by default
            // console.log(JSON.parse(res.body));//返回的数据
            //由于英雄详情页是由https://pvp.qq.com/web201605/herodetail/177.shtml组成,仅有最后的177数字不一样和
            //而此处的数可以通过res.body[i].ename中获取,所以此处就遍历req.body中的ename并发起英雄详情爬虫请求
            JSON.parse(res.body).forEach(v => {
                getheroinfo.queue(`https://pvp.qq.com/web201605/herodetail/${v.ename}.shtml`);
            });
        }
        done();
    }
});
//6.创建爬英雄详情的操作
var getheroinfo = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            hero_array.push({
                name: $(".cover-name").text(),
                skill: $(".show-list").first().find(".skill-name b").text(),
                icon: "http:"+$(".ico-play").prev("img").attr("src"),
                isdelete: false
            })
        }
        done();
    }
});
//7.发起英雄列表爬虫请求
getherolist.queue('https://pvp.qq.com/web201605/js/herolist.json');

//8.当英雄详情爬取请求结束后,执行;将所有英雄数据存入数据库中
getheroinfo.on('drain', function () {
    // For example, release a connection to database.
    // db.end();// close connection to MySQL
    console.log("请求完毕")
    console.log(hero_array);//获得所有的英雄数据

    //9.调用API：向数据库添加数据
    heroModel.insert(hero_array, (err, results) => {
        console.log(err);
        console.log(results);
        if (!err) console.log('增加成功');
    });
});



// app.listen(4499, () => {
//     console.log("数据服务器已启动");
// })
