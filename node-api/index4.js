var express=require('express');//expressjs사용
var app=express();
var morgan=require('morgan');

var users=[
{
    id:1,name:'alice'
},{
    id:2,name:'bob'
},{
    id:3,name:'kristin'
}
];
app.use(morgan('dev'));//미들웨어 사용 use morgan은 dev

app.get('/users',function(req,res){
    res.json(users);
});

app.listen(3000,function(){
    console.log("runnion 3000 port!");
});