import React, { Component } from 'react';
import _ from 'lodash';
import './components/StyledTetris.css';

import getWeb3 from './utils/getWeb3';

import Tetris2 from './contracts/Tetris.json'; /* link to /build/contracts */
const ROWS = 12;
const COLS = 10;
const pixelStyle = {
  height: `${100/ROWS}%`,
  width: `${100/COLS}%`,
};

const TShaped = [
[
  [false, true, false],
  [true, true, true],
],
[
  [true, false],
  [true, true],
  [true, false],
],
[
  [false, false, false],
  [true, true, true],
  [false, true, false],
],
[
  [false, true],
  [true, true],
  [false, true],
],
];

const JShaped = [
[
  [false, true],
  [false, true],
  [true, true],
],
[
  [false, false, false],
  [true, true, true],
  [false, false, true],
],
[
  [true, true],
  [true, false],
  [true, false],
],
[
  [true, false, false],
  [true, true, true],
],
];

const LShaped = [
  [
    [true, false],
    [true, false],
    [true, true],
  ],
  [
    [false, false, true],
    [true, true, true],
  ],
  [
    [true, true],
    [false, true],
    [false, true],
  ],
  [
    [true, true, true],
    [true, false, false],
  ],
  ];

const ZShaped = [
  [
    [false, true],
    [true, true],
    [true, false],
  ],
  [
    [true, true, false],
    [false, true, true],
  ],
  [
    [false, true],
    [true, true],
    [true, false],
  ],
  [
    [true, true, false],
    [false, true, true],
  ],
  ];
const SShaped = [
[
  [true, false],
  [true, true],
  [false, true],
],
[
  [false, true, true],
  [true, true, false],
],
[
  [true, false],
  [true, true],
  [false, true],
],
[
  [false, true, true],
  [true, true, false],
],
];
const OShaped = [
  [
    [true, true],
    [true, true],
  ],
  [
    [true, true],
    [true, true],
  ],
  [
    [true, true],
    [true, true],
  ],
  [
    [true, true],
    [true, true],
  ],
  ];
  const IShaped = [
    [
      [true],
      [true],
      [true],
      [true],
    ],
  [
    [true,true,true,true]
  ],
  [
    [false,true],
    [false,true],
    [false,true],
    [false,true],
  ],
  [
  [true,true,true,true]
  ],
  ];

const SHAPES = [TShaped, JShaped, SShaped, OShaped, IShaped, ZShaped, LShaped];

class Tetris extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //여기서부터 메타마스크 연결시켜야 함
      web3: null,
      accounts: null,
      contract: null,

    //여기부터는 프론트엔트 완료했음      
      coin:0, //코인을 베팅해서 성공했을시 돈을 주는 형태
      activePiece: null,
      board: Array(ROWS).fill(null).map(_ => Array(COLS).fill(false)), //fill은 정적인 값 하나로 채우고, map은 함수를 통해 값을 설정
      scores: 0,
      goal: 0,
      TotalScore: 1,
    };
    this.attachEventListeners=this.attachEventListeners.bind(this);
    this.spawnPiece=this.spawnPiece.bind(this);
    this.startGameLoop=this.startGameLoop.bind(this);
    this.startGame=this.startGame.bind(this);
    this.onChangeCoin=this.onChangeCoin.bind(this);
    this.checkScore=this.checkScore.bind(this);
  }

  
  componentDidMount = async () => {
    try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();//아이디 하나를 받음
        const deployedNetwork = Tetris2.networks[networkId]; // 이걸로 network address를 찾아야하는데 아직 못찾음
        const instance = new web3.eth.Contract(
              Tetris2.abi,
              deployedNetwork && deployedNetwork.address,
        );
      
        instance.events.CheckScores() //contract주소가 일치하지 않는 문제를 지금 겪는중 맞춰야 한다.
            .on('data', (event) => this.CheckEvent(event))
            .on('error', (error) => console.log(error));
        this.setState({web3, accounts, contract: instance});

        //instance.events.method()로 이벤트관리할 수 있고 web3.eth.subscribe()로도 이벤트 관리 가능

        

        instance.events.Score() //contract주소가 일치하지 않는 문제를 지금 겪는중 맞춰야 한다.
        .on('data', (event) => this.resultScore(event))
        .on('error', (error) => console.log(error));
    this.setState({web3, accounts, contract: instance});

    } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
            'Failed to load web3, accounts, or contract. Check console for details.'
        );
        console.log(error);
    }
};

  CheckEvent =(result) => { //여기서 emit발생한 누적점수를 볼수있게 수정.
    console.log(result.returnValues);
    const myScore = parseInt(result.returnValues.scores);
    this.setState({TotalScore: myScore});     
  };

  resultScore =(result) => { //여기서 emit발생한 누적점수를 볼수있게 수정.
    alert(result.returnValues.tem);  
  };
    startGameLoop=async()=> {
    console.log(this.state.accounts);
    this.timer = setInterval(async() => {
      if (!this.state.activePiece) {
        return; 
      }
      const { x, y } = this.state.activePiece;
      const board = this.combinedBoard();
      
      if (this.checkNextStateForCollision(x, y + 1)) {
        this.setState({
          board: this.RemoveLine(board), //내려갔을때 충돌할 경우
          activePiece: null,
        });
        
        this.spawnPiece(); //새로운 블록 생성
        if(this.GameOver()){ //맨 위에 블럭이 멈추면 게임 오버
          clearInterval();
          this.startGameLoop=null;
          this.setState({
                coin:0,
                board:this.state.board.map(_=> Array(COLS).fill(false)),
                activePiece:null,
                goal:15,
              });
          if(this.state.scores>=1){//this.state.accounts[0]은 메타마스크에 접속한 주소
            console.log(this.state.contract);

            try{
              const r=await this.state.contract.methods.win(this.state.scores).send({from: this.state.accounts[0]}); //점수를 이상 뽑을 경우 돈 결제 하기
              console.log(r);
            }catch(error){
              console.log(error.message);
            }
          }else{
            alert("점수를 달성하지 못하였습니다.");
        } this.setState({
          scores:0
        });
        window.location.reload();
          
          //여기서 돈 결제 시스템 가자
        };
        return;
      }
      
      this.setState({
        activePiece: {
          ...this.state.activePiece, //... 기존의 것을 유지하기
          y: this.state.activePiece.y + 1,
        },
      });
    }, 380);
  }
  
  spawnPiece() {//나오는 테트리스 결정하기
    //처음 시작
    const shapeIndex = _.random(0, SHAPES.length - 1); //어떤 블록일지 결정
    const shape2 = _.random(0, SHAPES[shapeIndex].length - 1); //정한 블록의 형태를 결정
    const piece = SHAPES[shapeIndex][shape2];
    this.setState({
      activePiece: {
        shapeIndex,
        x: _.random(0, COLS - piece[0].length),
        y: 0,
        shape2,
      },
    });
  }
  GameOver(){
    if(this.state.board[0][3]==true ||this.state.board[0][4]==true||this.state.board[0][5]==true || this.state.board[0][6]==true){
      //게임 오버시켜야함
      return true;
      //멈추는거 성공
    }
    return false;
  }
  attachEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (!this.state.activePiece) {
        return;
      }
      const { x, y, shapeIndex, shape2 } = this.state.activePiece;
      switch (event.code) {
        case 'ArrowLeft':
          case 'ArrowRight':
            if (this.checkNextStateForCollision(x + (event.code === 'ArrowLeft' ? -1 : 1), y)) {
              return;
            }
            this.setState({
              activePiece: {
                ...this.state.activePiece,
                x: Math.max(0, Math.min(COLS - 1, (this.state.activePiece.x + (event.code === 'ArrowLeft' ? -1 : 1)))),
            },
          });
          break;
          case 'ArrowUp':
          const shape = SHAPES[shapeIndex];
          //돌리는 위치에 아무것도 없을때만 돌리기 있으면 멈춤!
          if(this.checkNextOrientationBlock(x,y)){
            return;
          }
          if(this.checkNextOrientation(x,y)){ 
            //끝에서 돌렸을때 돌릴수 있는지 확인
            if(x>5){
              if(this.state.activePiece.shapeIndex!=4){
                this.setState({
                  activePiece: {
                    ...this.state.activePiece,
                    x:x-1,
                    shape2: (this.state.activePiece.shape2 + 1) % shape.length,
                  },
                });
              }else{
                this.setState({
                  activePiece: {
                    ...this.state.activePiece,
                    x:x-3,
                    shape2: (this.state.activePiece.shape2 + 1) % shape.length,
                  },
                });
              }
          }else{
            this.setState({
              activePiece: {
                ...this.state.activePiece,
                x:x+1,
                shape2: (this.state.activePiece.shape2 + 1) % shape.length,
              },
            });
          }
            return;
          }
          this.setState({
            activePiece: {
              ...this.state.activePiece,
              shape2: (this.state.activePiece.shape2 + 1) % shape.length,
            },
          });
          break; //내렸을때와 끝에서 모양 바꿧을때만 수정하면 됨
          case 'ArrowDown':
            const board= this.combinedBoard();
            if(this.checkNextStateForCollision(x,y+1)){
              this.setState({
                board: this.RemoveLine(board), //내려갔을때 충돌할 경우
              activePiece: null,
            });
            this.spawnPiece();
          }else{
          this.setState({
            activePiece: {
              ...this.state.activePiece,
              y: Math.min(ROWS - 1, (this.state.activePiece.y + 1)),
            },
          });
        }
          break;
          default:
            break;
      }
    });
  }
  checkNextOrientationBlock(x,y){
    const board = this.state.board;
    const shape2 = (this.state.activePiece.shape2+1) % 4;
    const {shapeIndex} = this.state.activePiece;
    const piece = SHAPES[shapeIndex][shape2];
    for (let i = 0; i < piece.length; i++) {
      const row = piece[i];
      var a=0;
      var b=0;
      for (let j = 0; j < row.length; j++) {
        if (board[y + i][x + j]==true && piece[i][j]==true) { //piece의 위치와 board의 위치를 잘 결정해야 한다.
          return true;
        }
      }
    }
    return false;
  }
  checkNextOrientation(x, y) {
    const {shapeIndex}  = this.state.activePiece; //activePiece 안의 변수값을 가져오는 최신형태
    const shape2 = (this.state.activePiece.shape2 + 1) % 4; //orientation이 정의안됨
    const board = this.state.board;
    const piece = SHAPES[shapeIndex][shape2]; 
    // 범위 안에 있는지 확인
    if (y + piece.length - 1 >= ROWS || x + piece[0].length - 1 >= COLS || x < 0) {
      return true;
    }
    // 이미 있는 벽돌과의 충돌
    for (let i = 0; i < piece.length; i++) {
      const pieceRow = piece[i];
      for (let j = 0; j < pieceRow.length; j++) {
        if (board[y + i][x + j] && piece[i][j]) {
          return true; // true가 갈곳에전부 false인 경우에만 성공!!
        }
      }
    }

    return false;
  }
  checkNextStateForCollision(x, y) {
    const { shape2, shapeIndex } = this.state.activePiece;
    const board = this.state.board;
    const piece = SHAPES[shapeIndex][shape2];
    if (y + piece.length - 1 >= ROWS || x + piece[0].length - 1 >= COLS || x < 0) {
      return true;
    }
    for (let i = 0; i < piece.length; i++) {
      const pieceRow = piece[i];
      for (let j = 0; j < pieceRow.length; j++) {
        if (board[y + i][x + j] && piece[i][j]) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  RemoveLine(board) {
    const RemovedLine = board.filter(row => !_.every(row, cell => cell));
    const length = ROWS - RemovedLine.length;
    this.setState({
      scores: this.state.scores+length,
    });
    return [...Array(length).fill(null).map(_ => Array(COLS).fill(false)), ...RemovedLine];
  }
  
  combinedBoard() {
    const board = _.cloneDeep(this.state.board);
    
    if (this.state.activePiece) {
      const { x, y, shape2, shapeIndex } = this.state.activePiece;
      const piece = SHAPES[shapeIndex][shape2];
      for (let i = 0; i < piece.length; i++) {
        const pieceRow = piece[i];
        for (let j = 0; j < pieceRow.length; j++) {
          board[y + i][x + j] = board[y + i][x + j] || piece[i][j]; //true인것이 있다면 true로 바꾼다.
        }
      }
    } 
    return board;
  } 
  checkScore= async ()=>{
    if(!this.state.web3){
      alert("메타마스크에 연결되지 않았습니다. F5 버튼을 눌러 로그인하십시오.");
      return;
    }
    console.log(this.state.contract);
    try{
      console.log(this.state.accounts)
     const r= await this.state.contract.methods.check().send({from: this.state.accounts[0]});
     console.log(r.transactionHash);
    }
    catch(error){
      console.log(error.message);
    }
  }
  startGame = async () =>{
     if(!this.state.web3){
      alert("메타마스크에 연결되지 않았습니다. F5 버튼을 눌러 로그인하십시오.");
      return;
    }
    //여기에 스마트 컨트랙을 시행해야함.
    try{
      const r=await this.state.contract.methods.startGame().send({from: this.state.accounts[0]}); //점수를 이상 뽑을 경우 돈 결제 하기
      console.log(r);//게임 시작메소드를 하면 현재 시간을 저장시킨다. from: 전자서명하는 계정 입력
    }catch(error){
      console.log(error.message);
    }
   // setTimeout(function() {
      // rest of code here
 //   }, 10000); //10초를 기다리게 하는 문법
    this.attachEventListeners();
    this.spawnPiece();
    this.startGameLoop();
  }

    onChangeCoin(e){
      this.setState({
        coin:e.target.value},
        );
    }

  render() {
    const board = this.combinedBoard();

    return (
      <div>
          <div className="StyledDisplay">
          <div className="game-board">
          {board.map(row =>
            row.map(cell =>
                <div className={`game-pixel ${cell ? 'filled' : ''}`} style={pixelStyle} background-color={this.changeRGB}/>)
            )}
          </div>
              <div className="StyledWrap"><br/><br/>  
              <button className="StyledButton" onClick={this.checkScore}>누적점수 확인</button>
                  <div className="StyledTetris">
                    누적점수: {this.state.TotalScore}                                   
                  </div>
                  <div className="StyledTetris">목표 점수: 15</div>
                  <div className="StyledTetris">달성 점수: {this.state.scores}</div>
                 <button className="StyledButton" onClick={this.startGame}>게임시작!</button>
                </div>
        </div>
      </div>
    );
  }
}

export default Tetris;