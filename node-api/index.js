const http= require('http');//http는 기본 모듈

const hostname= '127.0.0.1';
const port= 3000;

const fs= require('fs');
const data=fs.readFile('./data.txt', 'utf-8',function(err,data){
    console.log(data);
});

const server=http.createServer((req,res)=>{
    console.log(req.url);

    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    res.end("hello world");
})

server.listen(port, hostname,()=>{
    console.log('Server running at http://${hostname}:${port}/');
});
