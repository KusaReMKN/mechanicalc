'use strict';

const k = new MechaniCalc();
const ctx = new AudioContext();

let soundBuf = null;
async function
init()
{
	const res = await fetch('./bell.ogg');
	const buf = await res.arrayBuffer();
	const sbuf = await new Promise(r => ctx.decodeAudioData(buf, b => r(b)));
	soundBuf = sbuf;
}
init();

async function
play()
{
	if (!soundBuf)
		return;

	const src = new AudioBufferSourceNode(ctx, {
		buffer: soundBuf,
		loop: false,
	});
	src.connect(ctx.destination);
	src.start();
}

function
showVisibleBell()
{
	container.classList.replace('visible-bell-off', 'visible-bell-on');
	setTimeout(() => {
		container.classList.replace('visible-bell-on', 'visible-bell-off');
	}, 1000);
}

function
update()
{
	const a = k.getA();
	const c = k.getC();
	const d = k.getD();
	const shift = k.getShift();
	const dir = k.getDir();

	const slen = n => Math.max(0, 2*n - 1);

	if (k.getBell()) {
		play();
		showVisibleBell();
		k.clearBell();
	}

	output.textContent = '';

	output.textContent += `  ${' '.repeat(slen(c.length))}  `;
	output.textContent += '  ';
	output.textContent += ` ${' '.repeat(slen(a.length-d.length))}[ ${d.join(' ')} ]`;
	output.textContent += '\r\n';

	for (let i = 0; i < 10; i++) {
		output.textContent += `  ${' '.repeat(slen(c.length))}  `;
		output.textContent += '  ';
		if (i === 7) {
			output.textContent += `( ${dir} ) `
			output.textContent += ` ${' '.repeat(slen(a.length-d.length)-7)}`;
			output.textContent += `${i} `;
		} else {
			output.textContent += ` ${' '.repeat(slen(a.length-d.length)-1)}${i} `;
		}
		d.forEach(e => {
			output.textContent += ` ${i === e ? 'o' : ':'}`;
		});
		output.textContent += '\r\n';
	}

	output.textContent += `  ${' '.repeat(slen(c.length)-1)}v `;
	output.textContent += '\r\n';

	output.textContent += `${' '.repeat(2*shift)}`;
	output.textContent += `[ ${c.join(' ')} ]`;
	output.textContent += '  ';
	output.textContent += `[ ${a.join(' ')} ]`;
}

formControl.addEventListener('submit', e => {
	e.preventDefault();

	const proc = {
		// 置数レバー
		'btnLoadLeft':
			_ => k.loadLeft([...numData.value].map(e => +e)),
		'btnLoadRight':
			_ => k.loadRight([...numData.value].map(e => +e)),
		'btnLoadA':
			_ => k.loadA(),
		// クランクハンドル
		'btnAdd':
			_ => k.add(),
		'btnSub':
			_ => k.sub(),
		// 桁送り
		'btnFullLeft':
			_ => k.fullLeft(),
		'btnShiftLeft':
			_ => k.shiftLeft(),
		'btnShiftRight':
			_ => k.shiftRight(),
		'btnFullRight':
			_ => k.fullRight(),
		// レバークリア・帰零ハンドル
		'btnClearD':
			_ => k.clearD(),
		'btnClearC':
			_ => k.clearC(),
		'btnClearA':
			_ => k.clearA(),
	};
	(proc[e.submitter.id] || (_ => 0))();

	update();
});

update();
