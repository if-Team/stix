const fs = require('fs');
const path = require('path');

const undo = (parent, v, log) => {
	try{
		const cwd = path.join(__dirname, parent, v);
		if(!fs.existsSync(path.join(cwd, 'stix-rename-data.json'))){
			log(`Skipping ${v} : No stix renamed data!`);
			return false;
		}
	
		const data = JSON.parse(fs.readFileSync(path.join(cwd, 'stix-rename-data.json'), 'utf8'));
		Object.keys(data).forEach((k) => {
			fs.renameSync(path.join(cwd, k), path.join(cwd, data[k]));
		});
		fs.unlinkSync(path.join(cwd, 'stix-rename-data.json'));
		return true;
	}catch(e){
		log(`Skipping ${v}`);
		log(e);
		return false;
	}
};

module.exports = undo;
