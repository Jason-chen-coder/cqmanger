// //1.导包
// const express = require("express")
// const cookieSeesion = require("cookie-session");
// const app = express();


// app.use(cookieSeesion({
//     name: "session",
//     keys: ["add salt"],
//     maxAge: 7 * 24 * 60 * 60 * 1000//一周的时间
// }))
// app.get("/test", (req, res) => {
//     // res.writeHead(200, {
//     //     "Content-Type": "text/plain;charset=utf-8",
//     //     "Set-Cookie": "userid=123456"
//     // })
//     req.session.user = {name:"paddword",password:"123456"};

//     res.send("666");
// })

// app.get("/check",(req,res)=>{
//     console.log(req.headers);
//     res.send({
//         msg:"测试cookies",
//         cookies:req.session.user
//     })
// })
// app.listen(8799, () => { console.log("服务器启动成功") });

$(function(){
    //发送ajax,请求cookie数据,浏览器是否有cookie
    $.ajax({
        type:"get",
        url:"http://127.0.0.1:4399/islogin",
        success:function(res){
            if(res.code==200){
                console.log(res);
            }else{
                alert("你还没有登录,请登录");
                window.location.href="./login.html"
            }
        }
    })


}());