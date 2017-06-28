import "./index.css"
import React, {Component} from "react";

export class Video extends Component {
	constructor(props){
		super(props)
	}
	

	render() {
		return(
			<div>
				<div id="remote-media"></div>
				<div id="controls">
				<div id="preview">
					<p class="instructions">Hello Beautiful</p>
					<div id="local-media"></div>
					<button id="button-preview">Preview My Camera</button>
				</div>
				<div id="room-controls">
					<p class="instructions">Room Name:</p>
					<input id="room-name" type="text" placeholder="Enter a room name"values={game} />
					<button id="button-join">Join Room</button>
					<button id="button-leave">Leave Room</button>
				</div>
				<div id="log"></div>
				</div>
			</div>
		);
	}
}