import React, {Component} from 'react';

import {Grid, Row, Col, Panel,Image} from 'react-bootstrap';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import "./css/bootstrap.min.css";
import './css/style.css';
import getWeb3 from './utils/getWeb3';

import Tetris2 from './contracts/Tetris.json'; /* link to /build/contracts */

class Home extends Component{
    constructor(props){
        super(props);
        this.state={
            web3: null,
            accounts: null,
            contract: null,
            ether:0, //하우스 game ether
            changeEther:0, // ether로 game ether 사려는 
            gameToken:0, //내 game ether
    
        };
        this.charging2=this.charging2.bind(this);
        this.charging=this.charging.bind(this);
        this.checkToken=this.checkToken.bind(this);
        this.checkGame=this.checkGame.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
        
    }
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
                
            instance.events.checkHouseEther() 
                .on('data', (event) => this.CheckEvent(event))
                .on('error', (error) => console.log(error));

            instance.events.checkToken()
                .on('data', (event)=> this.checkToken(event))
                .on('error', (error)=> console.log(error));
                
            instance.events.checkToken2()
                .on('data', (event)=> this.checkToken2(event))
                .on('error', (error)=> console.log(error));

            instance.events.etherToGameToken()
                .on('data', (event) => this.checkGameToken(event))
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
    
    charging2 = async() => {
        if(!this.state.web3){
            alert("메타마스크에 연결되지 않았습니다. F5 버튼을 눌러 로그인하십시오.");
            return;
          }
          try{
            console.log(this.state.accounts)
           const r= await this.state.contract.methods.charging("10000").send({from: this.state.accounts[0]});
           console.log(r.transactionHash);
          }
          catch(error){
            console.log(error.message);
          }
    }

    charging = async() => {
        if(!this.state.web3){
            alert("메타마스크에 연결되지 않았습니다. F5 버튼을 눌러 로그인하십시오.");
            return;
          }
          try{
            console.log(this.state.accounts)
           const r= await this.state.contract.methods.charging2("10000").send({from: this.state.accounts[0]});
           console.log(r.transactionHash);
          }
          catch(error){
            console.log(error.message);
          }
    }

    checkGameToken = (result) => {
           const houseEther = parseInt(result.returnValues.house);
           const myEther = parseInt(result.returnValues.myEther);
        this.setState({ether: houseEther, gameToken:myEther});     
    
    }


    checkToken=(result)=>{
        const addr=result.returnValues.gameToken;
        alert(addr);
        //alert("GameToken 주소: "+ result.returnValues.gameToken+"\n DrawToken 주소: "+result.returnValues.drawToken);
    }

    checkToken2=(result)=>{
        const addr=result.returnValues.drawToken;
        alert(addr);
        //alert("GameToken 주소: "+ result.returnValues.gameToken+"\n DrawToken 주소: "+result.returnValues.drawToken);
    }

    checkTokenAdd2= async()=>{
        const {web3, accounts, contract} = this.state;
        if(!web3){
            alert("F5를 눌러 메타마스크에 접속하시오!");
            return;
        }
        try{
            const r= await contract.methods.checkTokenAddress2().send({from: accounts[0]});
            console.log(r.transactionHash);     
        }catch(e){
            console.log(e.message);
        }
    }

    checkTokenAdd= async()=>{
        const {web3, accounts, contract} = this.state;
        if(!web3){
            alert("F5를 눌러 메타마스크에 접속하시오!");
            return;
        }
        try{
            const r= await contract.methods.checkTokenAddress().send({from: accounts[0]});
            console.log(r.transactionHash);     
        }catch(e){
            console.log(e.message);
        }
    }

    CheckEvent=(result)=>{
        const houseEther = parseInt(result.returnValues.house);
        this.setState({ether: houseEther});     
    }


    SignUp=()=>{
        const {web3} = this.state;
        if(!web3){
            console.log("메타마스크에 로그인하십시오");
            return;
        }
        const id=web3.eth.accounts.create();
        alert("공개키: "+ id.address+"\n"+"비밀 키: "+id.privateKey+"\n"+"이 정보를 메타마스크에 추가하고 오프라인에서 보관하시오")
     }

     checkGame= async()=>{
        const {web3, accounts, contract} = this.state;
        if(!web3){
            alert("F5를 눌러 메타마스크에 접속하시오!");
            return;
        }
        try{
            const r= await contract.methods.checkMyGameToken().send({from: accounts[0]});
            console.log(r.transactionHash);     
        }catch(e){
            console.log(e.message);
        }
    
     }
    
    handleSubmit = async() => {
        //돈 Game토큰으로 교환하기
        const {web3, accounts, contract} = this.state;
        if(!web3){
            alert("메타마스크에 로그인하십시오!");
            return;
        }//자신의 이더를 사용해 게임 토큰을 가져온다.
        try{
            alert(web3.utils.toWei(String(this.state.changeEther)));
            const r= await contract.methods.buyGameToken().send({from: accounts[0], value: web3.utils.toWei(String(this.state.changeEther), 'ether')});
            console.log(r.transactionHash);
           }catch(e){
               console.log(e.message);
            }
        
    }

    handleChange=(event)=>{
        this.setState({changeEther:event.target.value}); //바꾸려고 입력한 이더
    }
     
    render(){
        return (
            
                 <div>
            <Grid fluid={true}>
                <Row className="show-grid">
                    <Col md={3}>

                    </Col>
                    <Col md={5}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                                <Panel.Title > 
                                    <Glyphicon glyph="thump-up"/> 배포자전용 이더충전
                                </Panel.Title>
                            </Panel.Heading>
                            <Panel.Body className="custom-align-center">
                                <div>
                                    <button  onClick={this.charging2}>game 충전하기</button>
                                    <button  onClick={this.charging}>draw 충전하기</button>
                                </div>
                            </Panel.Body>
                            <Panel.Footer>
                                현재 하우스이더:{this.state.ether}
                            </Panel.Footer>
                        </Panel>
                            <Panel bsStyle="info"> 
                                <Panel.Heading>
                                    <Panel.Title>
                                        소비자전용: 이더로 Game토큰 교환하기
                                    </Panel.Title>
                                </Panel.Heading>
                                <Panel.Body>
                                    <div>
                                        <form >
                                            <input type="text" value={this.state.changeEther} onChange={this.handleChange}/>
                                        </form>
                                        <button onClick={this.handleSubmit}>돈 교환하기</button><br/>
                                        0.000000000000000001 이 돈을 입력창에 복사해서 넣으십시오. 
                                    </div>
                                </Panel.Body>
                                <Panel.Footer>
                                    <div>
                                        My GameToken:{this.state.gameToken}<br/>
                                        하우스 이더와 본인이 가지고 있는 돈을 확인하라면 <button onClick={this.checkGame}>새로고침</button>
                                    </div>
                                </Panel.Footer>
                            </Panel>
                            <Panel>
                                <div>
                                    <button onClick={this.checkTokenAdd}>
                                        game Token 주소확인하기
                                    </button>  <br/>
                                    <button onClick={this.checkTokenAdd2}>
                                        draw Token 주소확인하기
                                    </button>    
                                </div>
                            </Panel>
                        
                    </Col>
                    </Row>
                    
            </Grid>
            

            </div>
        );
    }
}

export default Home;