var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Tetris = artifacts.require("./Tetris.sol");
var Game = artifacts.require("./GameToken");
var Draw = artifacts.require("./DrawToken");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  //deployer.deploy(Game);
  //deployer.deploy(Draw);
  deployer.deploy(Tetris);
};
