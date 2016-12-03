const fs = require('fs');
const path = require('path');

const doRename = (parent, _v, log) => {
	const cwd =  path.join(__dirname, parent, _v);
	const cwdContents = fs.readdirSync(cwd);
	let key;
	cwdContents.every((f, k) => {
		if(f.endsWith('moc')){
			key = k;
			return false;
		}
		return true;
	});
   
	if(!key){
		log(`Skipping ${_v}...`);
		return false;
	}
   
	try{
		if(cwdContents[key + 1] === undefined){
			log(`Skipping ${_v}...`);
			return false;
		}
		
		const fileMap = {};
		
		const modelPath = path.join(cwd, cwdContents[key + 1]);
		const model = JSON.parse(fs.readFileSync(modelPath), 'utf8');

		fileMap[path.join(_v + '.model.json')] = cwdContents[key + 1];
		fileMap['character.dat'] = cwdContents[key];
		
		fs.renameSync(modelPath, path.join(cwd, _v + '.model.json'));
		fs.renameSync(path.join(cwd, cwdContents[key]), path.join(cwd, 'character.dat'));
		
		let dir = cwdContents.slice();
		dir[key] = undefined;
		dir[key + 1] = undefined;
		dir = dir.filter(v => v !== undefined);
		const files = [];
		
		if(model.textures) files.push(...model.textures);
		if(model.motions) Object.keys(model.motions).map((v) => model.motions[v]).forEach((v) => {
			files.push(...v.map((v) => v.file));
		});
		if(model.expressions) files.push(...model.expressions.map((v) => v.file));
		
		files.sort().forEach((v, k) => {
			fileMap[v] = dir[k];
			fs.renameSync(path.join(cwd, dir[k]), path.join(cwd, v));
		});
		
		fs.writeFileSync(path.join(cwd, 'stix-rename-data.json'), JSON.stringify(fileMap));
		return true;
	}catch(e){
		log(`Skipping ${_v}...`);
		log(e);
		return false;
	}
};

module.exports = doRename;
