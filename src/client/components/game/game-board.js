import "./game-board.scss";

import React from "react";
import * as A from "../../actions";
import {ContainerBase} from "../../lib/component";

import Card from "./card";
import PlayerHand from "./player-hand";
import Stacks from "./stacks";

const TIMER_REASONS = {
	[A.WAIT_GAME_OVER]: "game over",
	[A.WAIT_REASON_GAME_FINISHED]: "it ended",
	[A.WAIT_REASON_TOO_FEW_PLAYERS]: "there are too few players",

	[A.WAIT_ROUND_OVER]: "round over",
	[A.WAIT_REASON_CZAR_LEFT]: "the czar left",
	[A.WAIT_REASON_ROUND_FINISHED]: "it ended"
};

export default class GameBoard extends ContainerBase {
	constructor(props) {
		super(props);

		this.state = {isHandOpen: false};

		this._selectCard = card =>
			this.request(A.gameSelectCard(this.state.game.id, card.id));

		this._selectStack = stack =>
			this.request(A.gameSelectStack(this.state.game.id, stack.id));

		this._toggleHand = () =>
			this.setState({isHandOpen: !this.state.isHandOpen});
	}

	componentWillMount() {
		const {stores: {game}} = this.context;
		this.subscribe(game.view$, game => this.setState({game}));
		this.subscribe(game.player$, player => this.setState({player}));
		this.subscribe(game.opSelectCard$, opSelectCard => this.setState({opSelectCard, isHandOpen: opSelectCard.can}));
		this.subscribe(game.opSelectStack$, opSelectStack => this.setState({opSelectStack}));
	}

	render() {
		const {game, player, opSelectCard, opSelectStack, isHandOpen} = this.state;
		const round = game.round;
		const timer = game.timer || {};

		if (!round)
			return null;

		let message = null;
		let messageIsActive = false;

		switch (game.step) {
			case A.STEP_CHOOSE_WHITES:
				messageIsActive = opSelectCard.can;
				message = opSelectCard.can
					? "double-click to pick your cards!"
					: "waiting for other players...";
				break;

			case A.STEP_JUDGE_STACKS:
				messageIsActive = opSelectStack.can;
				message = opSelectStack.can
					? "You're the czar. Pick the winning cards!"
					: "waiting for the czar...";
				break;

			case A.STEP_WAIT:
				message = `${TIMER_REASONS[timer.type]}, ${TIMER_REASONS[timer.reason]}`;
				break;
		}

		const ourStackId = game.step == A.STEP_CHOOSE_WHITES
			&& player && player.stack && player.stack.id;

		const stacks = ourStackId
			? round.stacks.map(s => s.id == ourStackId ? player.stack : s)
			: round.stacks;


		const isGameOver = timer.type== A.WAIT_GAME_OVER && timer.reason == A.WAIT_REASON_GAME_FINISHED;
		const winnerName = isGameOver ?
			game.players.filter(player => player.isWinner)[0].name :
			'';
		const endMessage = isGameOver?
			<div style={{
				zIndex: 1000,
				background: '#4da6ff',
				position: 'fixed',
				top: '20vh',
				bottom: '20vh',
				left: '20vw',
				right: '20vw',
				color: 'white',
				padding: 10,
				textAlign: 'center',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 40,
				borderRadius: 12
			}}>
					!! The winner is  {winnerName} !! <br /> Game Over :)
			</div>
			: null;

		return (
			<section className="c-game-board">
				<div className="black-card">
					<Card type="black" card={round.blackCard} />
					<div className={`game-status ${messageIsActive ? "is-active" : ""}`}>
						{message}
						{endMessage}
					</div>
				</div>
				<Stacks
					stacks={stacks}
					ourStackId={ourStackId}
					opSelectStack={opSelectStack}
					selectStack={this._selectStack} />
				<PlayerHand
					opSelectCard={opSelectCard}
					selectCard={this._selectCard}
					hand={player.hand}
					toggle={this._toggleHand}
					isOpen={isHandOpen} />
			</section>
		);
	}
}