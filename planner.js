// import utils from "./utils";
function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

class RouteApp {
	constructor() {
		this.missions = [{ from: "new york", to: "station", item: "ash", amount: "10" }, { from: "new york", to: "station", item: "ash", amount: "10" }, { from: "new york", to: "station", item: "ash", amount: "10" }, { from: "new york", to: "station", item: "ash", amount: "10" }, { from: "new york", to: "station", item: "ash", amount: "10" }, { from: "new york", to: "station", item: "ash", amount: "10" }];
		this.tableBody = document.getElementById("missionTableBody");
		this.routeOutput = document.getElementById("routeOutput");
		this.clearAll();
	}

	ensureExtraRow() {
		const last = this.missions[this.missions.length - 1];
		if (last && (last.from || last.to || last.item || last.amount)) {
			this.missions.push({ from: "", to: "", item: "", amount: "" });
		}
	}

	renderTable() {
		// Save focus
		const active = document.activeElement;
		const selectionStart = active?.selectionStart;
		const selectionEnd = active?.selectionEnd;
		const id = active?.id;

		this.tableBody.innerHTML = "";

		this.missions.forEach((mission, index) => {
			const row = document.createElement("tr");

			["from", "to", "item", "amount"].forEach(field => {
				const cell = document.createElement("td");
				const input = document.createElement("input");

				input.type = field === "amount" ? "number" : "text";
				input.value = mission[field];
				input.id = `mission-${index}-${field}`;

				input.addEventListener("input", (e) => {
					this.missions[index][field] = e.target.value;
					this.ensureExtraRow();
					this.renderTable();
					this.renderRoute();
				});

				cell.appendChild(input);
				row.appendChild(cell);
			});

			// Delete button
			const deleteCell = document.createElement("td");
			if (this.missions.length > 1) {
				const deleteBtn = document.createElement("button");
				deleteBtn.innerHTML = `  <span class="span-mother">
    <span>D</span>
    <span>e</span>
    <span>l</span>
    <span>e</span>
    <span>t</span>
    <span>e</span>
  </span>
  <span class="span-mother2">
    <span>D</span>
    <span>e</span>
    <span>l</span>
    <span>e</span>
    <span>t</span>
    <span>e</span>
  </span>`;
				deleteBtn.onclick = () => {
					this.missions.splice(index, 1);
					this.renderTable();
					this.renderRoute();
				};
				deleteCell.appendChild(deleteBtn);
			}
			row.appendChild(deleteCell);
			this.tableBody.appendChild(row);
		});

		// Restore focus
		if (id) {
			const newInput = document.getElementById(id);
			if (newInput && newInput.type === "text") {
				newInput.focus();
				newInput.setSelectionRange(selectionStart, selectionEnd);
			} else if (newInput) {
				newInput.focus(); // Just focus number inputs without setting range
			}
		}
	}

	renderRoute() {
		const route = this.buildRoute();
		const output = [];
		const pendingDropoffs = [];
		const completedPickups = new Set();

		for (let location of route) {
			output.push(location);
			const rowsHere = this.missions.filter(row => row.from === location || row.to === location);

			// Handle pickups
			for (let row of rowsHere) {
				if (row.from === location) {
					output.push(`Pick up ${row.amount} ${row.item} for ${row.to}`);
					completedPickups.add(`${row.from}->${row.to}:${row.item}:${row.amount}`);
				}
			}

			// Handle drop-offs
			for (let row of rowsHere) {
				if (
					row.to === location &&
					completedPickups.has(`${row.from}->${row.to}:${row.item}:${row.amount}`)
				) {
					output.push(`Drop off ${row.amount} ${row.item} from ${row.from}`);
				} else if (row.to === location) {
					// Defer this drop-off
					pendingDropoffs.push(row);
				}
			}
		}

		// second pass for any undelivered cargo
		const remainingStops = [];
		const seenStops = new Set(route);

		for (let row of pendingDropoffs) {
			const tag = `${row.from}->${row.to}:${row.item}:${row.amount}`;

			// potentail issue here

			if (
				completedPickups.has(tag) &&
				(!seenStops.has(row.to) || route.includes(row.to))
			) {
				remainingStops.push(row.to);
				route.push(row.to); // Extend route
				console.log('row.to', row.to);
			}
		}

		for (let location of remainingStops) {
			output.push(location);
			for (let row of pendingDropoffs) {
				if (
					row.to === location &&
					completedPickups.has(`${row.from}->${row.to}:${row.item}:${row.amount}`)
				) {
					output.push(`Drop off ${row.amount} ${row.item} from ${row.from}`);
				}
			}
		}



		let html = '';
		let currentLocation = null;

		for (const [index, item] of output.entries()) {
			if (!item.startsWith('Pick up') && !item.startsWith('Drop off')) {

				// location
				if (currentLocation !== null) {
					html += '</ul></li>';
				}
				currentLocation = item;
				html += `<li><strong>${item}</strong>`;
			} else {
				// action and cargo
				// html += `<li><label class="container">${item}<input type="checkbox" /><span class="checkmark"></span></label></li>`;
				html += `${this.buildCheckbox(item)}`;
			}

		}
		if (currentLocation !== null) {
			html += '</li>';
		}

		this.routeOutput.innerHTML = html;
	}

	buildRoute() {
		const graph = new Map();
		const inDegree = new Map();
		const nodes = new Set();

		for (const { from, to } of this.missions) {
			if (!from || !to) continue;
			if (!graph.has(from)) graph.set(from, []);
			graph.get(from).push(to);

			inDegree.set(to, (inDegree.get(to) || 0) + 1);
			if (!inDegree.has(from)) inDegree.set(from, 0);

			nodes.add(from);
			nodes.add(to);
		}

		const queue = [...nodes].filter(n => inDegree.get(n) === 0);
		const route = [];
		const visited = new Set();

		while (queue.length > 0) {
			const current = queue.shift();
			if (visited.has(current)) continue;

			route.push(current);
			visited.add(current);

			const neighbors = graph.get(current) || [];
			for (const neighbor of neighbors) {
				inDegree.set(neighbor, inDegree.get(neighbor) - 1);
				if (inDegree.get(neighbor) === 0) {
					queue.push(neighbor);
				}
			}
		}

		for (const node of nodes) {
			if (!visited.has(node)) {
				route.push(node);
				visited.add(node);
			}
		}

		return route;
	}

	generateStopInstructions(route) {
		const instructions = {};

		for (const stop of route) {
			const pickups = this.missions
				.filter(m => m.from === stop && m.item && m.amount && m.to)
				.map(m => `Pick up ${m.amount} ${m.item} for ${m.to}`);

			const dropoffs = this.missions
				.filter(m => m.to === stop && m.item && m.amount && m.from)
				.map(m => `Drop off ${m.amount} ${m.item} from ${m.from}`);

			if (pickups.length || dropoffs.length) {
				instructions[stop] = { pickups, dropoffs };
			}
		}

		return instructions;
	}

	clearAll() {
		this.missions = [{ from: "", to: "", item: "", amount: "" }];
		this.renderTable();
		this.renderRoute();
	}

	buildCheckbox(text = '') {
		if (!text) {
			return;
		}

		const checkboxeshtml = [
			{
				name: 'checkbox-scibble-circle',
				html: `<label for="{id_placeholder}" class="checkbox-wrapper-60"><input type="checkbox" class="check" id="{id_placeholder}"/><label for="{id_placeholder}" class="label"><svg viewBox="0 0 65 65" height="30" width="30"><rect x="7" y="7" width="50" height="50" stroke="black" fill="none" /><g transform="translate(-23,-967.36216)" id="layer1-60"><path id="path4146" d="m 55,978 c -73,19 46,71 15,2 C 60,959 13,966 30,1007 c 12,30 61,13 46,-23" fill="none" stroke="red" stroke-width="3" class="path1" /></g></svg><span>{text_placeholder}</span></label></label>`
			}, {
				name: 'checkbox-scibble-scratch',
				html: `<label for="{id_placeholder}" class="checkbox-wrapper-61"><input type="checkbox" class="check" id="{id_placeholder}"/><label for="{id_placeholder}" class="label"><svg width="45" height="45" viewbox="0 0 95 95"><rect x="30" y="20" width="50" height="50" stroke="black" fill="none" /><g transform="translate(0,-952.36222)"><path d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4 " stroke="red" stroke-width="3" fill="none" class="path1" /></g></svg><span>{text_placeholder}</span></label></label>`
			}, {
				name: 'checkbox-scibble-cross',
				html: `<label for="{id_placeholder}" class="checkbox-wrapper-62"><input type="checkbox" class="check" id="{id_placeholder}"/><label for="{id_placeholder}" class="label"><svg width="43" height="43" viewbox="0 0 90 90"><rect x="30" y="20" width="50" height="50" stroke="black" fill="none" /><g transform="translate(0,-952.36218)"><path d="m 13,983 c 33,6 40,26 55,48 " stroke="red" stroke-width="3" class="path1" fill="none" /><path d="M 75,970 C 51,981 34,1014 25,1031 " stroke="red" stroke-width="3" class="path1" fill="none" /></g></svg><span>{text_placeholder}</span></label></label>`
			},

		];

		const uuid = uuidv4();

		const ran = getRandomInt(3);

		return checkboxeshtml[ran].html.replaceAll('{id_placeholder}', uuid).replaceAll('{text_placeholder}', text);

	}


}

const app = new RouteApp();
