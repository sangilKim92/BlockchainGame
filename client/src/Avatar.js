import React, {Component ,Fragment} from 'react';

import {Grid, Row, Col, Panel,Image} from 'react-bootstrap';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import "./css/bootstrap.min.css";
import './css/style.css';

import {ListGroup, ListGroupItem} from 'react-bootstrap';
import getWeb3 from './utils/getWeb3';

import Tetris2 from './contracts/Tetris.json';

class Avatar extends Component{
    constructor(props) {
        super(props);
        this.state = {
          //여기서부터 메타마스크 연결시켜야 함
          web3: null,
          accounts: null,
          contract: null,

          gameToken:0,
          drawToken:0,

          
          addList: [],//계정 주소를 여기다 넣는다.
          firstBlock: null,
          secondBlock: null,

          beforeMoney:0,
          before:"GameToken",
          after:"DrawToken",
          afterMoney:0,
          num:4,

        };
        this.Voting=this.Voting.bind(this);
        this.checkArg=this.checkArg.bind(this);
      };


      componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            
    
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();//아이디 하나를 받음
            const deployedNetwork = Tetris2.networks[networkId]; // 이걸로 network address를 찾아야하는데 아직 못찾음
            const instance = new web3.eth.Contract(
                  Tetris2.abi,
                  deployedNetwork && deployedNetwork.address,
            );
                
              
                

            instance.events.etherToGameToken()
                .on('data', (event) => this.checkGameToken(event))
                .on('error', (error) => console.log(error));
            
            instance.events.resultVoting()
                .on('data', (event) => this.resultVoting(event))
                .on('error', (error) => console.log(error));

            instance.events.checkArgument()
                .on('data', (event) => this.checkArgument(event))
                .on('error', (error) => console.log(error));

            instance.events.congrat()
                .on('data', (event) => this.congrat(event))
                .on('error', (error) => console.log(error));
                
            instance.events.attendResult()
                .on('data', (event) => this.attendVoting(event))
                .on('error', (error) => console.log(error));

            this.setState({web3, accounts, contract: instance},);
            console.log(this.state.contract);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                'Failed to load web3, accounts, or contract. Check console for details.'
            );
            console.log(error);
        }
    };
      handleAfter=(e)=>{
        this.setState({afterMoney:e.target.value});
      }

      checkGameToken= async(result)=>{
        //game token과 drawtoken을 보여줘야 한다.
        const game = parseInt(result.returnValues.house);
    
        const draw = parseInt(result.returnValues.myEther);
     this.setState({gameToken: game, drawToken:draw});//앞에걸 game, 뒤에걸 draw로 하자.     
        //이 메소드는 샀을때와 새로고침 버튼을 클릭했을때 보여주기로 하자.
      }

      congrat= async(result)=>{
        //game token과 drawtoken을 보여줘야 한다.
        alert(result.returnValues.receiver);
        //이 메소드는 샀을때와 새로고침 버튼을 클릭했을때 보여주기로 하자.
      }

      checkArgument = async (result) =>{
        
        this.setState({addList: []});
        let fir= result.returnValues.firstBlocknumber;
        let sec= result.returnValues.secondBlocknumber;
          
        this.setState({addList: result.returnValues.output, firstBlock:fir, secondBlock: sec});
        console.log(this.state.addList);
      }

      attendVoting = async(result)=>{
        alert(result.returnValues.index+"번째로 등록하셨습니다. \n");
      }

      handleBefore=(e)=>{//여기서 돈을 입력하면 바꿀 돈도 계산해줘야한다.
        this.setState({beforeMoney:e.target.value});
        if(this.state.before=="GameToken"&&this.state.after=="DrawToken"){
          var cal=e.target.value/10;
          //게임머니 10당 추첨토큰 한개
          this.setState({afterMoney:cal,num:0});
        }else if(this.state.before=="DrawToken" && this.state.after=="ether"){
          var cal=e.target.value*(0.1**18);
          this.setState({afterMoney:cal,num:1});
        }else if(this.state.before=="ether" && this.state.after=="GameToken"){
          var cal=e.target.value*(10**18);
          this.setState({afterMoney:cal,num:2});
        }else{
          this.setState({num:4});
          alert("교환하려는 돈이 잘못되었습니다.");
        }
      }

      resultVoting= async (result) => {
        alert("추첨토큰이 부족하여 응모하실수 없습니다.");
      }

      handleBefore2=(e)=>{
        this.setState({before:e.target.value});
      }

      handleAfter2=(e)=>{
        this.setState({after:e.target.value});
      }

      exchange= async()=>{
           const {web3,accounts,contract,num} = this.state;
           if(!web3){
               alert("메타마스크에 로그인하십시오!");
               return;
           }//자신의 이더를 사용해 게임 토큰을 가져온다.
           if(num==0){
            //게임 토큰을 drawToken으로
               try{
                const r= await contract.methods.buyDrawToken(this.state.beforeMoney,this.state.afterMoney).send({from: accounts[0]});
                console.log(r.transactionHash);
               }catch(e){
                   console.log(e.message);
                }
           }else if(num==1){
             //drawToken을 ether로
             try{
              const r= await contract.methods.reFundEther(this.state.beforeMoney).send({from: accounts[0]});
              console.log(r.transactionHash);
             }catch(e){
                 console.log(e.message);
              }
          }else if(num==2){
              try{//ether로 game Token
                const r= await contract.methods.buyGameToken().send({from: accounts[0], value: web3.utils.toWei(String(this.state.beforeMoney), 'ether')});
               console.log(r.transactionHash);
              }catch(e){
                  console.log(e.message);
               }
           }else{
             alert("바꿀수 없는 조합입니다.");
           }
      }

      checkArg = async() =>{
         const {web3, contract, accounts} =this.state;
        try{
          const r= await contract.methods.checkArg().send({from: accounts[0]});
          console.log(r.transactionHash);

        }catch(e){
          console.log(e.message);
        }

      }

     

      checkmyToken= async() => {
        const {web3, contract, accounts} =this.state;
        try{
          const r = await contract.methods.checkMyToken().send({from: accounts[0]});
          console.log(r.transactionHash);
        }catch(e){
          console.log(e.message)
        }
      }
    

      Voting= async() => {
      const {web3, accounts, contract} = this.state;
      if(!web3){
          alert("메타마스크에 로그인하십시오!");
          return;
      }//자신의 이더를 사용해 게임 토큰을 가져온다.
      try{
          const r= await contract.methods.attendVoting().send({from: accounts[0]});
          console.log(r.transactionHash);
         }catch(e){
             console.log(e.message);
          }
    }
    render() {

      const style = {
        border: "1px solid black",
        padding: "8px",
        margin: "8px"
      };
  
  
        return (
          <div>
            <Grid fluid={true}>
              <Row className="show-grid">
                <Col md={3}>
                </Col>
                <Col md={5}>

                <Panel bsStyle="info">
                  <Panel.Heading>
                    <Panel.Title>
                      응모하기: Draw Token 한 개 필요!
                    </Panel.Title>
                  </Panel.Heading>
                <Panel.Body>
                      <button onClick={this.Voting}>응모하기</button>
                </Panel.Body>
                <Panel.Footer>
                  추첨은 랜덤으로 진행되며, 남은 Draw Token은 ether로 교환가능
                </Panel.Footer>
                </Panel>
                </Col>
                </Row>
              <Row>        
              <Col md={3}>
                <Panel bsStyle="info">
                  <Panel.Heading>
                    <Panel.Title>내 토큰 보기</Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    <button onClick={this.checkmyToken}>
                      현재 가지고 있는 토큰을 보려면 누르십시오
                    </button>
                  </Panel.Body>
                  <Panel.Footer>
                    게임 토큰: {this.state.gameToken}<br/>
                    추첨 토큰: {this.state.drawToken}
                  </Panel.Footer>
                </Panel>
              </Col>
              <Col md={5}>
                <Panel bsStyle="info">

                  <Panel.Heading>
                    <Panel.Title>
                      Draw 토큰으로 교환하기
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    원하는 코인들은 선택해서 교환하십시오.<br/>
                    0.000000000000000001 ether => 1GameToken
                    <form>
                      <select value={this.state.before} onChange={this.handleBefore2}>
                           <option value="GameToken">게임토큰</option>
                          <option value="DrawToken">추첨토큰</option>
                          <option value="ether">메인넷 ether</option>
                        </select><br/>
                       환전할 금액을 입력하세요 <br/> <input type="number" value={this.state.beforeMoney} onChange={this.handleBefore}></input>
                        <br/>
                      바꾸려는 돈을 선택해주세요<br/><select value={this.state.after} onChange={this.handleAfter2}>  
                          <option value="DrawToken">추천토큰</option>
                          <option value="ether">메인넷 ether</option>
                          <option value="GameToken">게임토큰</option>           
                      </select>
                      <br/>
                      {this.state.afterMoney}
                      </form>
                      <button onClick={this.exchange}>돈 교환하기</button>
                    </Panel.Body>
                  </Panel>
                  </Col>
                <Col md={4}>
                <Panel bsStyle="info">
                  <Panel.Heading>
                    <Panel.Title>당첨자 주소확인 및 블록넘버 확인</Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    첫번째 블록 주소: {this.state.firstBlock} <br/>
                    두번째 블록 주소: {this.state.secondBlock} <br/>

                  <ol>
                    {this.state.addList}
                  </ol>

                  </Panel.Body>
                  <Panel.Footer>
                    <button onClick={this.checkArg}>
                      당첨자 주소 및 블록넘버 확인하기
                    </button>
                  </Panel.Footer>
                </Panel>
              </Col>
              </Row>
            </Grid>
          </div>
        );
      }
}



export default Avatar;