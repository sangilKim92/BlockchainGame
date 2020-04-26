pragma solidity ^0.5.0;

import "./Token.sol";

contract GameToken is Token {


        address owner; //owner만 가능하게 해주는 함수를 위한 주소 onlyOwner을 사용하기 위한
        uint256 _initialAmount;
        uint8 _decimalUnits;
        string _tokenName;
        string _tokenSymbol;
        uint totalSupply;
        uint houseEther;//하우스에 저장시키는 이더

    //생성한사람한테 owner 지정하기
    constructor (address deployer) public{
        owner = deployer;
        balances[deployer] = 10000000000000;   //배포자 주소에 이더 저장시키기 balances가 각 주소의 이더량.
        totalSupply = 10000000000000;                        // 총 이더의 수
        _tokenName = "GAME TOKEN";                                   // 토큰 이름
        _decimalUnits = 18;                            // Amount of decimals for display purposes
        _tokenSymbol = "GAME";                               // Set the symbol for display purposes
    }


    function transfer(address _to, uint256 _value)external returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[owner] >= _value && _value > 0) {
            //balances[msg.sender] 이 기본인데 배포자만 보낼수있게 수정하였다.
            balances[owner] -= _value;
            balances[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        } else {
             return false;
        }
    }

        function makeToken()external returns(bool success){
            houseEther++;
            return true;
    }

        function transfer2(address _from, uint256 _value)external returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && _value > 0) {
            //balances[msg.sender] 이 기본인데 배포자만 보낼수있게 수정하였다.
            balances[_from] -= _value;
            houseEther += _value;
              return true;
        } else {
             return false;
        }
    }


    function transferFrom(address _from, address _to, uint256 _value)external returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            emit Transfer(_from, _to, _value);
            return true;
        }else {
            return false;
        }
    }


    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balances[_owner];
    }


    function approve(address _spender, uint256 _value)public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }


    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }


    function getTotalSupply() external view returns (uint256 supply){
        return totalSupply;
    } 

    function charging(uint256 scores) external returns(bool success){
        require(balances[owner]>scores,"소유자의 이더가 충전하려는 이더보다 적습니다.");
        houseEther += scores;
        balances[owner] -= scores;
        return true;
    }

    function checkHouseEther() external view returns(uint){
        return houseEther;
    }

    function Token(address _to, uint amount) external returns(bool success){
            if (houseEther >= amount && amount > 0) {
            //하우스로부터 돈을 받는 스마트 컨트랙트이다.
            houseEther -= amount;
            balances[_to] += amount;
            emit Transfer(msg.sender, _to, amount);
            return true;
        } else {
             return false;
        }
    }


    
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

}