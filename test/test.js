const Tetris=artifacts.require("Tetris.sol");

contract("Tetris",function(accounts){

    it("소유자가 아니면 실행이 안된다."), async()=>{
        let instance= await Tetris.deployed();

        await instance.kill({from:accounts[0]});
    }
})
