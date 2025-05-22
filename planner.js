class RouteApp {
	constructor() {
		this.missions = [{ from: "", to: "", item: "", amount: "" }];
		this.tableBody = document.getElementById("missionTableBody");
		this.routeOutput = document.getElementById("routeOutput");
		this.renderTable();
		this.renderRoute();
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
 
		// Now do a second pass for any undelivered cargo
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

		this.routeOutput.innerHTML = output.map(item => `<li>${item}</li>`).join('');
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
}

const app = new RouteApp();
