'use strict';

const delay = 100;
const sleep = _ => new Promise(r => (update(), setTimeout(_ => r(), delay)));

async function
div(k)
{
	k.clearBell();
	k.clearC();
	await sleep();
	k.fullRight();
	do {
		do {
			await sleep();
			k.sub();
		} while (!k.getBell());
		await sleep();
		k.add();
		await sleep();
	} while (k.shiftLeft());
}

async function
mul(k, x)
{
	const s = [...x.toString()].map(e => +e);

	k.clearC();
	await sleep();
	k.fullLeft();
	await sleep();
	while (s.length > 0) {
		switch (s.pop()) {
			case 5:
				k.add();
				await sleep();
			case 4:
				k.add();
				await sleep();
			case 3:
				k.add();
				await sleep();
			case 2:
				k.add();
				await sleep();
			case 1:
				k.add();
				await sleep();
			case 0:
				break;

			case 6:
				k.sub();
				await sleep();
			case 7:
				k.sub();
				await sleep();
			case 8:
				k.sub();
				await sleep();
			case 9:
				k.sub();
				await sleep();
				s.push((s.pop() || 0) + 1);
		}
		k.shiftRight();
		await sleep();
	}
	k.fullLeft();
	await sleep();
}
