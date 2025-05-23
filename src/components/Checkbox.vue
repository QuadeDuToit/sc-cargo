<template>
	<div class="holder">
		<label v-if="ran === 0" class="checkbox">
			<input type="checkbox" />
			<span class="box"></span>

			<svg class="svg scribble" viewBox="0 0 120 100">
				<g transform="translate(-10,-952.36222)">
					<path d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
						stroke="black" stroke-width="3" fill="none" class="path1" />
				</g>
			</svg>
		</label>

		<label v-if="ran === 1" class="checkbox">
			<input type="checkbox" />
			<span class="box"></span>

			<svg class="svg circle" viewBox="0 950 100 100" height="30" width="30">
				<g transform="translate(0,0) scale(1.02)" id="layer1-60">
					<path id="path4146" d="m 55,978 c -73,19 46,71 15,2 C 60,959 13,966 30,1007 c 12,30 61,13 46,-23"
						fill="none" stroke="black" stroke-width="3" class="path1" />
				</g>
			</svg>
		</label>
		<label v-if="ran === 2" class="checkbox">
			<input type="checkbox" />
			<span class="box"></span>
			<svg class="svg cross" width="30" height="30" viewBox="0 0 30 30">
				<g transform="translate(0, 0)">
					<!-- Slight bow from top-left to bottom-right -->
					<path d="M 5,5 C 15,10 15,20 25,25" stroke="black" stroke-width="2" class="path1" fill="none" />
					<!-- Slight bow from top-right to bottom-left -->
					<path d="M 25,5 C 15,10 15,20 5,25" stroke="black" stroke-width="2" class="path1" fill="none" />
				</g>
			</svg>
		</label>
	</div>
</template>

<script setup>

import { defineProps } from 'vue'


const props = defineProps({
	text: {
		type: String,
	}
})

const uuidv4 = () => {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}


const uuid = uuidv4();
const ran = getRandomInt(3);

</script>



<style lang="postcss" scoped>
.checkbox {
	position: relative;
	height: 50px;
	width: 50px;
	display: block;
	cursor: pointer;

	input[type="checkbox"] {
		display: none;
		position: absolute;
		z-index: 2;
		height: 50px;
		width: 50px;
		margin: 0;
		cursor: pointer;
	}

	.box {
		border: solid 1px rgb(199, 199, 199);
		height: 22px;
		width: 22px;
		position: absolute;
		top: 7px;
		left: 5px;
	}

	.svg {
		shape-rendering: geometricPrecision;
		position: absolute;
		top: 0;
		left: 0;

		.path1 {
			stroke: red
		}

		&.scribble {
			position: absolute;
			top: 0;
			left: 0;

			.path1 {
				stroke-dasharray: 400;
				stroke-dashoffset: 400;
				opacity: 0;
				transition: stroke-dashoffset 0.5s ease, opacity 0.5s ease;
			}
		}

		&.circle {


			.path1 {
				stroke-dasharray: 400;
				stroke-dashoffset: 400;
				opacity: 0;
				transition: stroke-dashoffset 0.5s ease-out, opacity 0.3s ease-in;
			}
		}

		&.cross {


			.path1 {
				stroke-dasharray: 400;
				stroke-dashoffset: 400;
				opacity: 0;
				transition: stroke-dashoffset 0.5s ease-out, opacity 0.3s ease-in;
			}
		}

	}

	input[type="checkbox"]:checked~.svg .path1 {
		stroke-dashoffset: 0;
		opacity: 1;
	}
}
</style>