pragma solidity ^0.5.0;

import "./GameToken.sol";
import "./DrawToken.sol";

contract Tetris{

    address payable public owner;
    bool isFinished = false;
    address cel;
    uint private max=5;//이 인원이 꽉차면 roleVoting이 돌아간다.
    

    mapping(address=>bool) blockUser;
    mapping(address=>uint) userCounts; //각 유저의 누적점수를 올리기 위한 용도    
    mapping(address=>uint) gameCheck;

    
    address[2] tokenAddress;//토큰 컨트랙의 어드레스를 받아서 함수를 시행시킬 변수이다.
    //스마트컨트랙(스마트컨트랙주소)를하면 배포한 스마트 컨트랙트를 사용할수 있다.

    address[] votingAddress;

    uint private lockMoney=0;
    uint private lockMoney2=0;
    uint private time=0;

    uint firstBlock;
    uint secondBlock;

    event CheckScores(uint scores);//자신의 누적점수 보기
    event checkHouseEther(uint house); //하우스에 저장된 이더 보기
    event etherToGameToken(uint house,uint myEther); //이더리움을 이용해서 GameToken을 구매한 경우 보기
    event checkToken(address gameToken); //GameToken, Draw토큰 컨트랙트 주소 보기
    event checkToken2(address drawToken); //GameToken, Draw토큰 컨트랙트 주소 보기

    event resultVoting();
    event failVoting(string result);
    event congrat(address receiver); //당첨자의 주소를 return 시킨다.
    event checkArgument(address[] output,uint firstBlocknumber, uint secondBlocknumber);//주소를 리턴시킨다.
    event Score(string tem); //시간이 1분 미만이라 누적점수 얻는 것을 실패한 event

    event attendResult(uint index); //응모에 참여했을 때, 몇번째 배열인지 확인시켜주는 용도

    constructor () public {
        owner = msg.sender; //컨트랙트를 배포하는 사람을 owner로 정의한다.
        tokenAddress[0] = address(new GameToken(msg.sender)); //이 스마트 컨트랙을 배포한 사람한테 토큰도 같이
        //배포 시키고 전체 이더를 준다. tokenAddress에 스마트 컨트랙 주소를 저장시킨다.
        tokenAddress[1] = address(new DrawToken(msg.sender));
    }

    modifier onlyOwner {
        require (msg.sender == owner, "Tetris:Only owner can call this function.");
        _;
    }

    function example(address to, uint amount)external {
        GameToken(tokenAddress[0]).transfer(to,amount);
        //이런식으로 다른 스마트 컨트랙트의 함수를 사용한다.
    }


    function checkTokenAddress() external{
        emit checkToken(tokenAddress[0]);
    }
    function checkTokenAddress2() external{
        emit checkToken2(tokenAddress[1]);
    }

    function checkMyToken() external{
        uint game = GameToken(tokenAddress[0]).balanceOf(msg.sender);
        uint draw = DrawToken(tokenAddress[1]).balanceOf(msg.sender);
        emit etherToGameToken(game, draw);
    }

    function buyDrawToken(uint16 gameToken, uint16 drawToken) external payable{
        //gameToken을 사용해서 drawToken을 사야한다.
        uint myGameToken = GameToken(tokenAddress[0]).balanceOf(msg.sender);
        require(myGameToken > gameToken,"Tetris: you dont have that much gameToken");
        uint HouseDrawToken = lockMoney2; //하우스의 draw 토큰을 가져옴
        require(HouseDrawToken > drawToken,"Tetris: Sorry, House Ether is lack of your request");
        //게임토큰을 다시 보내고 추첨토큰을 가져와야한다.
        if(GameToken(tokenAddress[0]).transfer2(msg.sender,gameToken)){
            //게임 토큰 보냄
            DrawToken(tokenAddress[1]).getDrawToken(msg.sender,drawToken);
            lockMoney2 -= drawToken;
            lockMoney += gameToken;

            myGameToken = GameToken(tokenAddress[0]).balanceOf(msg.sender);
            HouseDrawToken = DrawToken(tokenAddress[1]).balanceOf(msg.sender);

            emit etherToGameToken(myGameToken, HouseDrawToken);
        }
    }

    function startGame() external{//여기에서 유저가 게임을 시작하면 그 유저의 주소에 현재 시간을 저장시킨다.
        if(blockUser[msg.sender]==false){
        gameCheck[msg.sender] = now;
        blockUser[msg.sender] = true;
        }else if(block.timestamp -gameCheck[msg.sender] > 10 minutes ){
            gameCheck[msg.sender] = now;
            blockUser[msg.sender] true;
        }
    }
    function reFundEther(uint drawToken)external payable{
        //drawtoken으로 ether로 환불하기
        //먼저 컨트랙트 내에 ether가 얼마 있는지부터 확인
        uint myEther = address(this).balance;
        require(myEther > drawToken,"Tetris: in contract, we don't have enough ether");
        //스마트 컨트랙 돈이 더 많으니 이제 보내야한다.
        uint myEther2 = DrawToken(tokenAddress[1]).balanceOf(msg.sender);
        require(myEther2> drawToken,"Tetris: you don't have that much drawToken");

        if(DrawToken(tokenAddress[1]).transferFrom(msg.sender,owner,drawToken)){
            lockMoney2 += drawToken;
            msg.sender.transfer(drawToken);// 컨트랙트 내의 돈을 전달
            emit etherToGameToken(myEther,myEther2-drawToken);//기존의 drawToken에다가 -해서 보여준다.
        }
    }

    function getGameToken() external{
        //누적점수를 이용해서 게임 토큰을 얻는다.
        require(userCounts[msg.sender]>5,"Tetris: you dont have enough scores!");
        if(GameToken(tokenAddress[0]).Token(msg.sender,1)){
            lockMoney--;
            userCounts[msg.sender] -= 5;
        }

    }

    function buyGameToken()external payable{
        //여기서 GameToken을 사야함.
        uint amount = msg.value;
        require(amount < lockMoney,"Tetris: your ether is larger than house money");
        if(GameToken(tokenAddress[0]).Token(msg.sender,amount)){
            lockMoney -= amount;
            uint myEther = GameToken(tokenAddress[0]).balanceOf(msg.sender);
            emit etherToGameToken(lockMoney,myEther);//이더리움을 이용해서 Game이더 구입
            //넘겨온 이더는 컨트랙트에 있음
        }
    }

    function attendVoting()external {
        //사용자가 추첨에 지원하는 것
        //DRAW 토큰을 하나 써야함
        if(isFinished==true){
            isFinished=false;
            votingAddress.length=0;
        }
        uint256 pos = 0;
        isFinished = false;
        if(DrawToken(tokenAddress[1]).useToken(msg.sender)){
        //voting 배열에 지원자를 추가함.
        pos = votingAddress.push(msg.sender); //배열에 추가시킨다.
        if(pos==max-1){
            firstBlock=block.number;
        }
        if(pos==max){

            roleVoting();
        }
            emit attendResult(pos);
            //pos가 원래 정한 위치의 숫자라면 그 주소의 값을 해쉬값에 추가시킨다.
        }else{//돈이 없어서 실패
            emit resultVoting();
        }
    }

    function roleVoting() private {
        //추첨을 돌리는 함수 다 하고 나면 배열을 초기화 시킨다.
        secondBlock = block.number;
        bytes32 random = keccak256(abi.encodePacked(blockhash(secondBlock),blockhash(firstBlock)));
        
        
        uint len = uint(random)%votingAddress.length;
        isFinished=true;
        cel=votingAddress[len];
        //cel은 당첨자의 주소를 저장시킨다.
        emit congrat(votingAddress[len]);
    }

    function checkArg() external{
        //인자값으로 넣은 주소를 보여준다.
        if(isFinished){
            emit checkArgument(votingAddress,firstBlock,secondBlock);//인덱스에 들어간 주소를 전부 리턴시켜야 한다.
        }else{
            emit failVoting("아직 응모가 종료되지 않았습니다.");
            //새롭게 시작해서 확인못한다고 해야 한다.
        }
    }
    
    function charging(uint scores)external onlyOwner payable{ //배포자로부터 스마트컨드랙트에 이더를 받는다.
        require(owner==msg.sender,"Only owner can charge ether");
        if(GameToken(tokenAddress[0]).charging(scores)){
        lockMoney += scores;
        uint myEther = GameToken(tokenAddress[0]).balanceOf(msg.sender);
        emit etherToGameToken(lockMoney, myEther);
        }
        //HanyangToken을 충전하는 이더
    }

    function charging2(uint scores)external onlyOwner payable{ //배포자로부터 스마트컨드랙트에 이더를 받는다.
        require(owner==msg.sender,"Only owner can charge ether");
        if(DrawToken(tokenAddress[1]).charging(scores)){
        lockMoney2 += scores;
        uint myEther = DrawToken(tokenAddress[0]).balanceOf(msg.sender);
        emit etherToGameToken(lockMoney2, myEther);
        }
    }


    function win(uint scores)public{
        //payable은 함수가 이더를 받아야할때 사용된다.
        //msg.value는 이 함수로 넘어온 이더를 뜻하고
        //address.send(amount); 는 address로 돈을 보내는것을 뜻한다.
        //event를 사용해서 인자를 넘기면 front end에서는 args를 통해 인자를 사용할수 있다.
        if(blockUser[msg.sender]==true){

            blockUser[msg.sender]=false;
        if(3 minutes < block.timestamp-gameCheck[msg.sender]){
            //유저가 게임을 시작한 시간과 끝낸 시간이 1분보다 크면 무조건 주게 된다.
             require(0<scores,"your scores did not satisfy standardPoint");
            userCounts[msg.sender]++; //기준점수 이상 달성했으면 이 유저의 주소에 누적점수 1 추가
             if(userCounts[msg.sender]>10){
            //GameToken에서 토큰을 추가 발행한다.
            lockMoney++;//lockMoney가 스마트 컨트랙트가 가진 gametoken의 량이다.
            time++;
            GameToken(tokenAddress[0]).makeToken();
            if(time&10==0){
                //10번 게임토큰을 생성할때마다 DrawToken도 추가한다.
                lockMoney2++;
                DrawToken(tokenAddress[1]).makeToken();
             }
            }
            emit Score("게임시장이 3분 이상이고 누적점수 얻는 것에 성공하였습니다!");
        }else{
            emit Score("게임이용시간이 1분 미만이기에 누적점수 얻기에 실패하였습니다.");
            //게임시작시간과 종료시간이 1분이 안되었기에 실패한다.
        }
        //여기서 이제 더해도 응모권을 못얻는다는 event 발생
        }
    }
    // Funds withdrawal to maintain the house
        // 이 컨트랙에서 이더를 인출하는 메소드, 오직 owner만 해야한다

    function getEther(uint money)external{
        //누적점수를 이용해서 이더를 받는 스마트컨트랙.
        require(lockMoney > money,"we don't have enough ether");
        require(userCounts[msg.sender] > money, "you are not entitled"); //함수를 호출한 유저의 주소
        userCounts[msg.sender] -= money; //충전한것만큼 점수를 뺀다.
        lockMoney -= money;
        GameToken(tokenAddress[0]).Token(msg.sender, money);
        //하우스 이더에서 사용자한테 간다. 배포자가 보내는건 ㄴㄴ
    }

    function check()external{ //자신의 누적점수를 보고싶을때 누른다.
        uint he = userCounts[msg.sender];
        emit CheckScores(he);
    }

    function checkMyGameToken() external{
        uint myEther = GameToken(tokenAddress[0]).balanceOf(msg.sender);
        emit etherToGameToken(lockMoney, myEther);
    }
 
    function checkHouse()external{ //배포가자 컨트랙트에 저장시킨 이더를 확인시켜준다.
        uint he;
        he = lockMoney;
        emit checkHouseEther(he);
    }
    function checkHouse2()external{ //배포가자 컨트랙트에 저장시킨 이더를 확인시켜준다.
        uint he;
        he = lockMoney2;
        emit checkHouseEther(he);
    }

    function useItem()external view{
        //hanyang token으로 아이템을 사용한다.
        require(userCounts[msg.sender]>3,"누적점수");
    }


    function kill() external onlyOwner {
        selfdestruct(owner);
    }

    function () external payable {} //fallback 함수 . 이 컨트랙트가 배포될때 하우스의 초기운영자금이 저장되기 위해 만듬
}