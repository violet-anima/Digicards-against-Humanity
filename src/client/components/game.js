import "./game.scss";

import React from "react";
// import AppearIn from "appearin-sdk"
import * as A from "../actions";
import {ContainerBase} from "../lib/component";

import GameBoard from "./game/game-board";
import GameSetup from "./game/game-setup";
import Chat from "./chat";

class GameContainer extends ContainerBase {
	constructor(props) {
		super(props);


		this._videoCollapse = () => document.querySelector('.c-frame.collapsible').classList.toggle('collapsed');

		this._sendMessage = message =>
			this.request(A.gameSendMessage(this.state.game.id, message));
	}

	componentWillMount() {
		const {stores: {app, game}} = this.context;
		const {params} = this.props;
		const gameId = parseInt(params.gameId);

		this.subscribe(game.opJoinGame$, opJoinGame => this.setState({opJoinGame}));
		this.subscribe(game.opSendMessage$, opSendMessage => this.setState({opSendMessage}));
		this.subscribe(game.view$, game => this.setState({game}));
		this.subscribe(app.reconnected$, () => this.request(A.gameJoin(gameId)));

		this.request(A.gameJoin(gameId));
	}



	render() {


		const {opJoinGame, game} = this.state;
		let body = null;

		if (opJoinGame.inProgress) {
			body = <section className="notice"><p>Joining game...</p></section>;
		} else if (opJoinGame.error) {
			body = <section className="notice error"><p>Cannot join game: {opJoinGame.error}</p></section>;
		} else if (game.step == A.STEP_DISPOSED) {
			body = <section className="notice error"><p>Game doesn't exist!</p></section>;
		} else if (game.step == A.STEP_SETUP) {
			body = <GameSetup />;
		} else {
			body = <GameBoard />;
		}




		return (
			<div className="c-game">
					{body}
					<button classID="toggle-button" onClick={this._videoCollapse} >Toggle Video</button>
					<div className="c-frame collapsible">
							<iframe className="frame" src="https://appear.in/ifta" width="401" height="320" frameborder="0"></iframe>
					</div>
					<script src="//developer.appear.in/scripts/appearin-sdk.0.0.4.min.js"></script>

			</div>
		);
	}
}

class GameSidebar extends ContainerBase {
	constructor(props) {
		super(props);
		this._sendMessage = message =>
			this.request(A.gameSendMessage(this.state.game.id, message));
		this._exitGame = () => this.props.router.push("/");
		this._login = () => this.dispatch(A.dialogSet(A.DIALOG_LOGIN, true));
	}

	componentWillMount() {
		const {stores: {user, game}} = this.context;
		this.subscribe(game.opJoinGame$, opJoinGame => this.setState({opJoinGame}));
		this.subscribe(game.opSendMessage$, opSendMessage => this.setState({opSendMessage}));
		this.subscribe(user.opLogin$, opLogin => this.setState({opLogin}));
		this.subscribe(game.view$, game => this.setState({game}));
	}

	render() {
		const {opLogin, opJoinGame, opSendMessage, game} = this.state;
		let showChat = true;

		if (opJoinGame.inProgress) {
			showChat = false;
		} else if (opJoinGame.error) {
			showChat = false;
		} else if (game.step == A.STEP_DISPOSED) {
			showChat = false;
		}

		return (
			<section className="c-game-sidebar">
				<div style={{
					margin: 2,
					fontSize: 20,
					background: '#b709ff',
					color: 'white',
					borderRadius: 3,
					padding: 5
				}}>Digicards Against Humanity</div>
				<div className="m-sidebar-buttons">
					{!opLogin.can ? null :
						<button className="m-button primary" onClick={this._login}>
							Login to join game
						</button>}

					<button className="m-button" onClick={this._exitGame}>Leave game</button>
				</div>
				<div>
				{game.step == A.STEP_DISPOSED ? null :
					<PlayerList players={game.players} />}
				</div>
				{!showChat ? null :
					<Chat messages={game.messages} opSendMessage={opSendMessage} sendMessage={this._sendMessage} />}
			</section>
		);
	}
}

function PlayerList({players}) {
	return (
		<ul className="c-player-list">
			{players.map(player => {
				const [cls, status] = getPlayerStatus(player);
				return (
					<li key={player.id} className={cls}>
						<div className="details">
							<div className="name">{player.name}</div>
							<div className="score">
								{player.score}
								{player.score == 1 ? " point" : " points"}
							</div>
						</div>
						<div className="status">{status}</div>
					</li>
				);
			})}
		</ul>
	);
}

function getPlayerStatus({isCzar, isWinner, isPlaying}) {
	if (isCzar) return ["is-czar", "czar"];
	if (isWinner) return ["is-winner", "winner!"];
	if (isPlaying) return ["is-playing", "playing"];
	return ["", ""];
}

export default {
	main: GameContainer,
	sidebar: GameSidebar
};