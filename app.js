//1.导包
const express = require("express")
const multer = require("multer");
const hm = require("mysql-ithm");
const bodyparser = require("body-parser");
const cors = require("cors");
const svgCaptcha = require('svg-captcha');
//1.创建服务器
const app = express();

//2.配置
//2.1 创建upload文件夹
let upload = multer({ dest: "uploads/" })
//2.2 开放静态资源
app.use(express.static("static"));
app.use(express.static("uploads"));
//2.3配置bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
//2.4配置跨域cors
app.use(cors());
//3.数据库配置
//3.1连接数据库
//如果数据库存在则连接，不存在则会自动创建数据库
hm.connect({
    host: 'localhost',//数据库地址
    port: '3306',
    user: 'root',//用户名，没有可不填
    password: 'root',//密码，没有可不填
    database: 'heromanger'//数据库名称
});
//
//3.2创建Model(表格模型：负责增删改查)
let heroModel = hm.model('herolist', {
    name: String,
    skill: String,
    icon: String,
    isdelete: String
});
let userModel = hm.model('userlist', {
    name: String,
    password: String
});


//4.写接口
//4.1查询英雄列表
    app.get("/hero/list", (req, res) => {
    let { search } = req.query;
    console.log(search)
    // res.send(search); 
    //判断过来的参数是否为空
    if (search == "") {
        //直接搜索isdelete为false的所有英雄
        heroModel.find(`isdelete="false"`, (err, results) => {
            if (err == null) {
                res.send({
                    msg: "请求成功",
                    code: 200,
                    hero: results
                })
            } else {
                res.send({
                    msg: "请求失败",
                    code: 404,
                })
                console.log(err);
            }
        });
    } else {
        console.log(search)
        //搜索search且isdelete为false的英雄
        heroModel.find(`name like "%${search}%" and isdelete="false"`, (err, results) => {
            if (err == null) {
                res.send({
                    msg: "请求成功",
                    code: 200,
                    hero: results
                })
            } else {
                res.send({
                    msg: "请求失败",
                    code: 404,
                })
                console.log(err);
            }
        });
    }
    })
    //4.2查询英雄详情
    app.get("/hero/info", (req, res) => {

    })
    //4.3编辑英雄
    app.post("/hero/update", upload.single("icon"), (req, res) => {
    let id = req.body.id;
    let obj =req.body;
    //判断前端是否有传文件过来,如果没有文件过来那req.file是undefined,拿只需要修改技能和名字
    if(req.file !=undefined){
        obj.icon = "http://127.0.0.1:4399/" + req.file.filename
    }
        //3.3 修改数据库中的数据 
        heroModel.update(`id=${id}`, obj, (err, results) => {
            if (!err) {
                console.log('修改成功')
                res.send({
                    msg: "修改成功",
                    code: 200,
                })
            } else {
                console.log("修改失败");
                console.log("err");
                res.send({
                    msg: "修改失败",
                    code: 404,
                })
            }
        });
    })
    //4.4删除英雄
    app.post("/hero/delete", (req, res) => {
    console.log(req.body);
    let delete_id =req.body.id;
    //软删除(修改数据库中的isdelete)
    //3.2 将数据库中 id = 1 的数据，isdelete修改为false
    heroModel.update(`id=${delete_id}`,{isdelete:"true"},(err,results)=>{
        if (!err) {
            console.log('删除成功')
            res.send({
                msg: "删除成功",
                code: 200,
            })
        } else {
            console.log("删除失败");
            console.log(err);
            res.send({
                msg: "删除失败",
                code: 404,
            })
        }
    console.log(results);
});
    })
    //4.5根据id查询英雄详情
    app.get("/hero/infoid", (req, res) => {
    console.log(1);
    console.log(req.query);
    // 获取参数里的id名
    let heroid = req.query.id;
    // res.send(heroid);
    // 到数据库中查询该id名的英雄
    heroModel.find(`id=${heroid}`, (err, results) => {
        if (err == null) {
            res.send({
                msg: "查询成功",
                code: 200,
                data: results[0]
            })
        } else {
            res.send({
                msg: "查询失败",
                code: 404
            })
            console.log(err);
        }
    });
    })
    //4.6增加英雄
    app.post("/hero/add", upload.single("icon"), (req, res) => {
    heroModel.insert({
        name: req.body.name,
        skill: req.body.skill,
        icon: "http://127.0.0.1:4399/" + req.file.filename,
        isdelete: false
    }, (err, results) => {
        if (!err) {
            console.log('增加成功')
            res.send({
                msg: "新增成功",
                code: 200,
            })
        } else {
            console.log("新增失败");
            console.log("err");
            res.send({
                msg: "新增失败",
                code: 404,
            })
        }
    });

    })
    //4.7验证码接口
    let captchaText = "";
    app.get('/captcha', function (req, res) {
        var captcha = svgCaptcha.create();
        // console.log(captcha)//里面是插件生成的数据对象;text为验证码文本,data为验证码图片
        captchaText = captcha.text;
        res.type('svg');0
        res.status(200).send(captcha.data);
    });
    //4.8注册接口
    app.post("/register",upload.single("icon"),(req,res)=>{
        console.log(captchaText);
        let {username,password,code} = req.body;
        console.log(req.body);
        // 验证码判断
        if(code.toLowerCase()==captchaText.toLowerCase()){
            //验证码正确,下一步验证数据库中是否有相同账号;
            userModel.find(`name="${username}"`,(err,results)=>{
                // console.log(results);
                // console.log(results=="");
                if(results==""){
                    //数据库内没有改账号,可以进行注册,向数据库中添加该账号密码
                    userModel.insert({name:username,password:password},(err,results)=>{
                        if(!err) {
                            console.log('增加成功');
                            res.send({
                                msg:"注册成功",
                                code:200
                            })
                        }else{
                            console.log(err);
                            res.send({
                                msg:"注册失败",
                                code:404
                            })
                        };
                    });
                }else{
                    res.send({
                        msg:'已存在该用户名',
                        code:400
                    });
                }
            });
        }else{
            res.send({
                msg:"验证码有误",
                code:500
            })
        }
    })
    //4.9登录接口
    app.post("/login",upload.single("icon"),(req,res)=>{
        // res.send(req.body)//
        //验证账号密码
        userModel.find(`name="${req.body.username}" and password="${req.body.password}"`,(err,results)=>{
            // console.log(results);
            console.log(err)
            console.log(results.length);
            if(results.length==0){
                res.send({
                    msg:"登陆失败,账号或密码错误",
                    code:404
                });
            }else{
                res.send({
                    msg:"登陆成功",
                    code:200
                })
            }
            

        });
    })
    //4.10用户名验证接口
    app.get("/username",(req,res)=>{
        // res.send(req.query.username)//
        userModel.find(`name="${req.query.username}"`,(err,results)=>{
            if(err==null){
                if(results.length==0){
                    res.send({
                        msg:"该用户名可用",
                        code:200
                    })
                }else{
                    res.send({
                        msg:"该用户名已被注册",
                        code:404
                    })
                }
            }else{
                res.send({
                    msg:"服务器内部错误",
                    code:500
                })
            }
        })
    })
//5.启动服务器
app.listen(4399, () => console.log("服务器启动成功"))