//라우팅 설정

var express= require('express');
var app=express();

app.get('/',function(req,res){ //get으로 라우팅 설정
    res.send('Hello World');
});

app.listen(3000, function(){
    console.log('Example app listingon port 3000!');
})