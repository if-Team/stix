const async = require('async');
const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const rename = require('./rename');
const undo = require('./undo');
const logo =
`..................................................................................
.                                                                                .
.    $$$$$$$$$$$$$$$$$   $$$$$$$$$$$$$$$$$$$$$ $$$$$$$$$  $$$$             $$$$  .
.    $$$$$$$$$$$$$$$$$    $$$$$$$$$$$$$$$$$$$  $$$$$$$$$   $$$$           $$$$   .
.    $$$          $$$      $$$    $$$             $$$$$     $$$$         $$$$    .
.    $$$         $$$        $$$   $$$             $$$$      $$$$$       $$$$     .
.    $$$        $$$          $$$  $$$             $$$        $$$$$     $$$$$     .
.    $$$       $$$            $$$ $$$             $$$         $$$$$   $$$$$      .
.    $$$$     $$$              $$$$$$             $$$          $$$$$ $$$$$       .
.    $$$$$$$ $$$                $$$$$             $$$           $$$$$$$$$        .
.      $$$$$$$$                  $$$$             $$$            $$$$$$$         .
.        $$$$$$$                  $$$             $$$             $$$$$          .
.          $$$$$$$$               $$$             $$$             $$$$$          .
.             $$$$$$$             $$$             $$$            $$$$$$$         .
.               $$$$$$            $$$             $$$           $$$$ $$$$        .
.                  $$$            $$$             $$$          $$$$   $$$$       .
.                  $$$            $$$             $$$         $$$$     $$$$      .
.                  $$$            $$$             $$$        $$$$       $$$$     .
.                  $$$            $$$             $$$       $$$$         $$$$    .
.    $$$$$$$$$$$$$$$$$            $$$          $$$$$$$$    $$$$$         $$$$$   .
.    $$$$$$$$$$$$$$$$$            $$$          $$$$$$$$   $$$$$$$$$$$$$$$$$$$$$  .
..................................................................................

Please add your c_[number] folders into assets folder!`;

const symbols = {
	ok: '✓',
	err: '✖'
};

if(process && process.platform === 'win32'){
	symbols.ok = '√',
	symbols.err = '×'
}

const database = require('./pck-database.json');
const screen = blessed.screen({
	smartCSR: true,
	dockBorders: true,
	fullUnicode: true
});
screen.title = 'Welcome to STIX : the destiny child model renamer!';

const logoBox = blessed.box({
	top: 0,
	left: 'center',
	align: 'center',
	valign: 'middle',
	width: '100%',
	height: '70%',
	content: logo,
	tags: false,
	border: {
		type: 'line'
	},
	style: {
		fg: 'cyan',
		bg: 'grey',
		border: {
			fg: 'grey'
		}
	}
});

const mainButton = blessed.form({
	parent: screen,
	bottom: 0,
	left: 'center',
	align: 'center',
	valign: 'middle',
	width: '100%',
	height: '30%',
	keys: true
});

const buttonRename = blessed.button({
	parent: mainButton,
	mouse: true,
	keys: true,
	padding: {
		left: 1,
		right: 1
	},
	left: '25%',
	top: 2,
	width: '25%',
	height: 3,
	content: 'Rename DestinyChild models',
	name: 'rename',
	valign: 'middle',
	align: 'center',
	style: {
		bg: 'blue',
		fg: 'white',
		focus: {
			bg: 'white',
			fg: 'black'
		},
		hover: {
			bg: 'white',
			fg: 'black'
		}
	}
});

const buttonRenameWof = blessed.button({
	parent: mainButton,
	mouse: true,
	keys: true,
	padding: {
		left: 1,
		right: 1
	},
	left: '25%',
	top: 6,
	width: '50%',
	height: 3,
	content: 'Rename DestinyChild models without renaming folders.',
	name: 'rename',
	valign: 'middle',
	align: 'center',
	style: {
		bg: 'cyan',
		fg: 'white',
		focus: {
			bg: 'white',
			fg: 'black'
		},
		hover: {
			bg: 'white',
			fg: 'black'
		}
	}
});

const buttonUndo = blessed.button({
	parent: mainButton,
	mouse: true,
	keys: true,
	padding: {
		left: 1,
		right: 1
	},
	left: '50%',
	top: 2,
	width: '25%',
	height: 3,
	content: 'Undo renaming',
	name: 'undo',
	valign: 'middle',
	align: 'center',
	style: {
		bg: 'blue',
		fg: 'white',
		focus: {
			bg: 'white',
			fg: 'black'
		},
		hover: {
			bg: 'white',
			fg: 'black'
		}
	}
});

screen.append(logoBox);
screen.render();

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
});

const renderProgress = () => {
	logoBox.detach();
	mainButton.detach();

	const logView = blessed.log({
		parent: screen,
		width: '100%',
		height: '50%',
		top: 0,
		left: 0,
		label: 'Logs',
		tags: true,
		border: {
			type: 'line'
		}
	});

	const skippedView = blessed.log({
		parent: screen,
		width: '100%',
		height: '30%',
		top: '50%',
		left: 0,
		label: 'Skipped / Errors',
		tags: true,
		border: {
			type: 'line'
		}

	});

	const progress = blessed.progressbar({
		parent: screen,
		orientation: 'horizontal',
		filled: 0,
		width: '100%',
		height: '20%',
		left: 0,
		top: '80%',
		label: 'Progress',
		border: {
			type: 'line'
		},
		ch: ' ',
		style: {
			bar: {
				bg: 'blue',
				fg: 'blue'
			}
		}
	});

	screen.render();
	return {logView, skippedView, progress};
};

const createRenameListener = (changeFoldername) => {
	return () => {
		const {logView, skippedView, progress} = renderProgress();
		const rootDir = path.join(__dirname, 'assets');
		const dirs = fs.readdirSync(rootDir);
		setTimeout(() => {
			async.eachOfSeries(dirs, (v, k, cb) => {
				process.nextTick(() => {
					if(database[v] !== undefined && changeFoldername){
						let _v = v;
						v = database[v];
						fs.renameSync(path.join(rootDir, _v), path.join(rootDir, v));
					}

					let result = rename('assets', v, (content) => {
						skippedView.log(content);
					});

					if(result) logView.log(`{white-fg}{green-bg}  ${symbols.ok}  {/} Renamed ${v}`);
					else logView.log(`{white-fg}{red-bg}  ${symbols.err}  {/} Skipping ${v}`);

					progress.setProgress(Math.round(k / (dirs.length - 1) * 100));
					screen.render();
					setTimeout(cb, 50);
				});
			}, () => {
				logView.log(`{white-fg}{cyan-bg}  ${symbols.ok}  {/} All jobs done. Press Q to exit.`);
			});
		}, 1000);
	};
};

buttonRename.on('press', createRenameListener(true));
buttonRenameWof.on('press', createRenameListener(false));

buttonUndo.on('press', () => {
	const {logView, skippedView, progress} = renderProgress();
	const rootDir = path.join(__dirname, 'assets');
	const dirs = fs.readdirSync(rootDir);
	setTimeout(() => {
		async.eachOfSeries(dirs, (v, k, cb) => {
			process.nextTick(() => {
				let split = v.split('_');
				if(split.length > 2);
				let _v = v;
				v = `${split[0]}_${split[1]}`;
				fs.renameSync(path.join(rootDir, _v), path.join(rootDir, v));

				let result = undo('assets', v, (content) => {
					skippedView.log(content);
				});

				if(result) logView.log(`{white-fg}{green-bg}  ${symbols.ok}  {/} Undone ${v}`);
				else logView.log(`{white-fg}{red-bg}  ${symbols.err}  {/} Skipping ${v}`);

				progress.setProgress(Math.round(k / (dirs.length - 1) * 100));
				screen.render();
				setTimeout(cb, 50);
			});
		}, () => {
			logView.log(`{white-fg}{cyan-bg}  ${symbols.ok}  {/} All jobs done. Press Q to exit.`);
		});
	}, 1000);
});
