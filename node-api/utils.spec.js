const utils=require('./utils');
const assert=require('assert');
const should=require('should');

describe('utile 모듈의 capitalize는 ',()=>{
    it('문자열의 첫번째를 대문자로 바꾼다',()=>{
        const result=utils.capitalize("hello");
        assert.equal(result,'Hello');
    })
})

