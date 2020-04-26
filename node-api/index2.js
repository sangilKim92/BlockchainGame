const express=require('express');

const app=express();//서버에 필요한 미들웨어를 추가한다.
const morgan=require('morgan'); //다른사람의 미들웨어 사용방법



function logger2(req,res,next){
    console.log('i am logger2');
    next();
}
app.use(logger);//미들웨어 추가하는 메소드
app.use(logger2);
app.use(morgan('dev'));
function logger(req,res,next){//arg가 정해져있다
    console.log('i am logger');
    next();//미들웨어는 자기가 한일을 다한 다음 반드시 next를 써서 다음 로직을 실행하게 한다.
}
app.listen(3000,function(){
    console.log("running");
})//포트번호 