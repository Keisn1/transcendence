import { type BallDirection, type BallPosition } from "./ball";

// my initial approach
export function predictYIntersection(
    pos: BallPosition,
    dir: BallDirection,
    canvasHeight: number,
    intersectionX: number,
): number {
    // find previous bounce
    const initialBounceY = dir.dy > 0 ? 0 : canvasHeight;
    const stepsInDy = (pos.y - initialBounceY) / dir.dy;
    const initialBounceX = pos.x - dir.dx * stepsInDy;

    // find next bounce
    const nextBounceY = canvasHeight - initialBounceY;

    // calculate tha distance between bounces
    const tLeg = canvasHeight / Math.abs(dir.dy);
    const spanX = Math.abs(dir.dx) * tLeg;

    // calculate full spans between initial bounce and targetX
    let dx = Math.abs(initialBounceX - intersectionX);
    const k = Math.floor(dx / spanX);

    // leftover of full spans
    const m = dx - k * spanX;

    // fraction of the leftover along the leg
    const f = m / spanX;
    // calculate the y intersection
    let yHit = initialBounceY + (nextBounceY - initialBounceY) * f;

    // if k is odd, inverse the intersection point
    if (k % 2 === 1) {
        yHit = canvasHeight - yHit;
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
