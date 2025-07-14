// my initial approach
export function predictYIntersection(posX:number, posY:number, vx:number, vy:number, windowHeight:number, targetX:number): number {
	// find previous bounce
	const initialBounceY = vy > 0 ? 0 : windowHeight;
	const tSinceInitial = (posY - initialBounceY) / vy;
	const initialBounceX = posX - vx * tSinceInitial;

	// find next bounce
	const nextBounceY = vy > 0 ? windowHeight : 0;

	// calculate tha distance between bounces
	const tLeg = windowHeight / Math.abs(vy);
	const spanX = Math.abs(vx) * tLeg;

	// calculate full spans between initial bounce and targetX
	let dx = Math.abs(initialBounceX - targetX);
	const k = Math.floor(dx / spanX);

	// leftover of full spans
	const m = dx - k * spanX;

	// fraction of the leftover along the leg
	const f = m / spanX;
	// calculate the y intersection
	let yHit = initialBounceY + (nextBounceY - initialBounceY) * f;

	// if k is odd, inverse the intersection point
	if (k % 2 === 1) {
		yHit = windowHeight - yHit;
	}

	return yHit;
}

// bigger fish :(
// export function predictYIntersection(posX:number, posY:number, vx:number, vy:number, windowHeight:number, targetX:number): number {
// 	const t = (targetX - posX) / vx;
// 	const Y_unfold = posY + vy * t;
// 	const fullCycle = 2 * windowHeight;
// 	let r = Y_unfold % fullCycle;
// 	if (r < 0)r += fullCycle;
// 	return (r <= windowHeight) ? r : (fullCycle - r);
// }

// little test with correct result of 275.0625
// console.log(
// 	predictYIntersection(768, 326, -96, 163, 652, 30)
// );