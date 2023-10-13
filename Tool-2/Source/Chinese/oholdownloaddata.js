// Copyright (C) 2019 hetuw
// GNU General Public License version 2 https://www.gnu.org/licenses/gpl-2.0.txt

let isWin = process.platform === "win32";
let fileSeperator = '/';
if (isWin) fileSeperator = '\\';

const fs = require('fs');

const http = require('http');

let askForDate = false;
let forceUpdateMode = false; // if true will also update files that contain more bytes than they should have
let hideDownloadErrors = true; // errors can be harmless but scare people
var args = process.argv.slice(0);
for (var a = 2; a < args.length; a++) {
	if (args[a].toLowerCase() === '-force') forceUpdateMode = true;
	else if (args[a].toLowerCase() === '--force') forceUpdateMode = true;
	else if (args[a].toLowerCase() === '-f') forceUpdateMode = true;
	else if (args[a].toLowerCase() === 'force') forceUpdateMode = true;
	else if (args[a].toLowerCase() === 'f') forceUpdateMode = true;
	if (args[a].toLowerCase() === '-error') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === '--error') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === '-errors') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === '--errors') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === '-e') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === 'e') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === 'error') hideDownloadErrors = false;
	else if (args[a].toLowerCase() === 'errors') hideDownloadErrors = false;
	if (args[a].toLowerCase() === '-date') askForDate = true;
	else if (args[a].toLowerCase() === '--date') askForDate = true;
	else if (args[a].toLowerCase() === '-d') askForDate = true;
	else if (args[a].toLowerCase() === 'date') askForDate = true;
	else if (args[a].toLowerCase() === 'd') askForDate = true;
}
let updatesHappend = 0;

let bytesDownloaded = 0;
let filesDownloaded = 0;
let lastLogFilesDownloaded = -1;
let keepUpdating = true;

function createHttpOptions(link) {
	let hostname;
	let path;
	if (link.indexOf("//") > -1) {
        hostname = link.split('/')[2];
    } else {
        hostname = link.split('/')[0];
    }
	path = link.substring(link.indexOf(hostname)+hostname.length);
	let options = {
		hostname: hostname,
		path: path,
		timeout: 30000,
	};
	return options;
}

function getHttp( link ) {
	return new Promise( function (resolve, reject) {
// -------------------------------------------------------------------
		let options = createHttpOptions(link);
		var data = '';
		
		http.get(options, (resp) => {
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
			// The whole response has been received. Return the result.
			resp.on('end', () => {
				filesDownloaded++;
				bytesDownloaded += data.length;
				resolve(data);
			});
		}).on("error", (err) => {
			reject(err.message);
		});
// -------------------------------------------------------------------
	});
}

function getHttpSilent( link ) {
	return new Promise( function (resolve, reject) {
// -------------------------------------------------------------------
		let options = createHttpOptions(link);
		var data = '';

		http.get(options, (resp) => {
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
			// The whole response has been received. Return the result.
			resp.on('end', () => {
				resolve(data);
			});
		}).on("error", (err) => {
			reject(err.message);
		});
// -------------------------------------------------------------------
	});
}

const readline = require('readline');

async function getUserInput(question) {
	return new Promise( function (resolve, reject) {
// -------------------------------------------------------------------
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(question, (answer) => {
	  		rl.close();
			resolve(answer);
		});
// -------------------------------------------------------------------
	});
}

// -------------------------------------------------------------------

const maxDownloadsAtATime = 10000;
let downloadsInProgress = 0;
let intervDownloadQueue = null;

function DownloadInfo() {
	this.link = null;
	this.file = null;
}

var downloadQueue = [];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function sleep(millis) {
	return new Promise( resolve => {
		setTimeout(resolve, millis);
	});
}

function loopDownloadQueue() {
	while (downloadsInProgress < maxDownloadsAtATime && downloadQueue.length > 0) {
		let di = downloadQueue.shift();
		downloadFile(di.link, di.file);
	}
}

function addToDownloadQueue(link, file) {
	let di = new DownloadInfo();
	di.link = link;
	di.file = file;
	downloadQueue.push(di);
}

function downloadFile(link, file) {
	downloadsInProgress++;
	getHttp(link).then((data) => {
		downloadsInProgress--;
		fs.writeFile(file, data, (err) => {
			if (err) console.log("ERROR: "+err);
		});
	}).catch( function (err) {
		if (!hideDownloadErrors) console.log(err);
		if (!hideDownloadErrors) console.log("ERROR while downloading "+link);
		let waitSeconds = getRandomInt(7) + 7;
		if (!hideDownloadErrors) console.log("Trying again in "+waitSeconds+" seconds ...");
		if (!hideDownloadErrors) console.log(" ");
		setTimeout( () => {
			downloadsInProgress--;
			downloadFile(link, file);
		}, waitSeconds*1000);
	});
}

async function keepDownloading(link) {
	let success = false;
	let data;
	while (!success) {
		try {
			data = await getHttpSilent(link);
			success = true;
		} catch(err) {
			console.log("ERROR while downloading "+link);
			console.log(err);
			let waitSeconds = getRandomInt(7) + 7;
			console.log("Trying again in "+waitSeconds+" seconds ...");
			await sleep(waitSeconds*1000);
		}
	}
	return data;
}

// -------------------------------------------------------------------

const rootLink = "http://publicdata.onehouronelife.com/publicLifeLogData/";
const rootFolder = "oholData";

var date_begin = []; // contains 3 ints, year - month - day
var date_end = [];

var allLinks = []; // array of Links() - indices are servernames like "server12" or "bigserver2"

function Links() {
	this.link = ""; // contains link to the list of data and name links
	this.curseLink = ""; // contains link to the list of curse links
	this.dateLinks = []; // contains link to text file that has the data - indices are dates like "2019_02_09"
	this.dateLinksSize = []; // contains size of files in bytes
	this.nameLinks = []; // contains link to text file that has the names - indices are dates like "2019_02_09"
	this.nameLinksSize = []; // contains size of files in bytes
	this.curseLinks = []; // contains link to text file that has the curses - indices are dates like "2019_02_09"
	this.curseLinksSize = []; // contains size of files in bytes
}

main();
async function main() {
	if (askForDate) {
		await getBeginEndDates();
	}
	console.log("Downloading all data and saving it to '"+rootFolder+"'");
	console.log("This may take a while... ");
	console.log(" ");
	await getAllLinks();

	if (!fs.existsSync(rootFolder)){
   		fs.mkdirSync(rootFolder);
	}

	intervDownloadQueue = setInterval( loopDownloadQueue, 2000 );

	let intervUpdateLog = setInterval(() => {
		if (lastLogFilesDownloaded === filesDownloaded) return;
		lastLogFilesDownloaded = filesDownloaded;
		let percentProgress = (filesDownloaded/(filesDownloaded+downloadsInProgress+downloadQueue.length)*100).toFixed(2)+" %";
		console.log(getTimeStr()+" - "+filesDownloaded+" files downloaded "+bytesReadable(bytesDownloaded)+", "+(downloadsInProgress+downloadQueue.length)+" missing - status: "+percentProgress);
		if (downloadsInProgress <= 0) {
			if (keepUpdating) {
				lastLogFilesDownloaded = -1;
				filesDownloaded = 0;
				bytesDownloaded = 0;
				if (forceUpdateMode && updatesHappend > 0) {
					clearInterval(intervUpdateLog);
					clearInterval(intervDownloadQueue);
					console.log("Download complete!");
					return;
				}
				console.log("Updating files ... ");
				updateAllFiles();
				updatesHappend++;
				if (!keepUpdating) {
					clearInterval(intervUpdateLog);
					clearInterval(intervDownloadQueue);
					console.log("Download complete!");
				}
				return;
			}
			clearInterval(intervUpdateLog);
			clearInterval(intervDownloadQueue);
			console.log("Download complete!");
		}
	}, 5000);

	console.log("Downloading files ... ");
	downloadAll();
}

async function getBeginEndDates() {
	console.log("Input dates in this format 'YEAR_MONTH_DAY', for example '2019_01_23'");
	let datesAreGood = false;
	while (!datesAreGood) {
		date_begin = await getDateFromUser('date_begin: ');
		date_end = await getDateFromUser('date_end: ');

		if (dateEqualsDate(date_begin, date_end) > 0) {
			console.log("ERROR: date_begin is bigger than date_end "+getDateString(date_begin)+" > "+getDateString(date_end)+"\n");
		} else datesAreGood = true;
	}
	console.log(" ");
}

async function getDateFromUser(question) {
	let dateIsGood = false;
	let date;
	while (!dateIsGood) {
		let dateStr = await getUserInput(question);
		try {
			date = stringToDate(dateStr);
			let d = new Date(date[0]+'-'+date[1]+'-'+date[2]);
			if (isNaN(d.getTime())) console.log("ERROR: Invalid date: "+dateStr+"\n");
			else dateIsGood = true;
		} catch (err) {
			console.log("ERROR: Invalid date: "+dateStr+"\n");
		}
	}
	return date;
}

function downloadAll() {
	for (let server in allLinks) {
		let serverFolder = rootFolder+fileSeperator+server;
		fs.exists(serverFolder, (exists) => {
			if (!exists) {
				fs.mkdirSync(serverFolder);
			}
			downloadServerData(server, serverFolder);
		});
	}
}

function downloadServerData(server, serverFolder) {
	for (let d in allLinks[server].dateLinks) {
		let file = serverFolder+fileSeperator+d;
		fs.exists(file, (exists) => {
			if (!exists) addToDownloadQueue(allLinks[server].dateLinks[d], file);
		});
	}
	for (let d in allLinks[server].nameLinks) {
		let file = serverFolder+fileSeperator+d+"_names";
		fs.exists(file, (exists) => {
			if (!exists) addToDownloadQueue(allLinks[server].nameLinks[d], file);
		});
	}
	for (let d in allLinks[server].curseLinks) {
		let file = serverFolder+fileSeperator+d+"_curses";
		fs.exists(file, (exists) => {
			if (!exists) addToDownloadQueue(allLinks[server].curseLinks[d], file);
		});
	}
}

async function getAllLinks() {
	console.log("Downloading links: "+rootLink+"\n");
	let html_serverLinks = await keepDownloading(rootLink);
	let serverLinkList = html_serverLinks.match(/\=\"lifeLog_.+?\.com\//g);
	let curseLinkList = html_serverLinks.match(/\=\"curseLog_.+?\.com\//g);
	for (var i in serverLinkList) {
		let cLinkToList = String(serverLinkList[i]).substr(2);
		let serverName = String(String(cLinkToList.match(/_.+?\./)).match(/[A-Za-z0-9]+/));
		serverName = serverName.toLowerCase();
		allLinks[serverName] = new Links();
		allLinks[serverName].link = rootLink + cLinkToList;

		console.log("Downloading links: "+allLinks[serverName].link);
		let html_days = await keepDownloading(allLinks[serverName].link);
		let lines = html_days.split('\n');
		for (var l in lines) {
			let line = lines[l];
			let dayLink = line.match(/\=\"20.+?[^s]\.txt/g);
			if (dayLink) {
				dayLink = String(dayLink).substr(2);
				let date = stringToDate(dayLink);
				if (askForDate && !isValidDate(date)) continue;
				let dateStr = getDateString(date);
				allLinks[serverName].dateLinks[dateStr] = allLinks[serverName].link + dayLink;
				allLinks[serverName].dateLinksSize[dateStr] = parseInt(line.match(/[0-9]+$/gm));
				continue;
			}
			let nameLink = line.match(/\=\"20.+?_names\.txt/g);
			if (nameLink) {
				nameLink = String(nameLink).substr(2);
				let date = stringToDate(nameLink);
				if (askForDate && !isValidDate(date)) continue;
				let dateStr = getDateString(date);
				allLinks[serverName].nameLinks[dateStr] = allLinks[serverName].link + nameLink;
				allLinks[serverName].nameLinksSize[dateStr] = parseInt(line.match(/[0-9]+$/gm));	
			}
		}
	} 
	for (var i in curseLinkList) {
		let cLinkToList = String(curseLinkList[i]).substr(2);
		let serverName = String(String(cLinkToList.match(/_.+?\./)).match(/[A-Za-z0-9]+/));
		serverName = serverName.toLowerCase();
		if (!allLinks[serverName]) {
			console.log("Warning: Found curse log for server: "+serverName);
			console.log("Warning: But did not find any other data about this server");
			continue;
		}
		allLinks[serverName].curseLink = rootLink + cLinkToList;

		console.log("Downloading curse links: "+allLinks[serverName].curseLink);
		let html_days = await keepDownloading(allLinks[serverName].curseLink);
		let lines = html_days.split('\n');
		for (var l in lines) {
			let line = lines[l];
			let dayLink = line.match(/\=\"20.+?[^s]\.txt/g);
			if (dayLink) {
				dayLink = String(dayLink).substr(2);
				let date = stringToDate(dayLink);
				if (askForDate && !isValidDate(date)) continue;
				let dateStr = getDateString(date);
				allLinks[serverName].curseLinks[dateStr] = allLinks[serverName].curseLink + dayLink;
				allLinks[serverName].curseLinksSize[dateStr] = parseInt(line.match(/[0-9]+$/gm));
				continue;
			}
		}
	}
	let linkCount = 0;
	for (var key in allLinks) linkCount++;
	if (linkCount < 1) {
		console.log("ERROR: Could not find any links");
		process.exit();
	}
	console.log(" ");
}

async function updateAllFiles() {
	let allFiles = [];
	fs.readdirSync(rootFolder).forEach( (file) => {
		allFiles[file] = new Links();
	});
	let updateComplete = true;
	for (var server in allFiles) {
		let dir = rootFolder + fileSeperator + server;
		allFiles[server].link = dir;
		fs.readdirSync(dir).forEach( (file) => {
			let diff = 0;
			const filePath = dir+fileSeperator+file;
			const stats = fs.statSync(filePath);
			if (file.indexOf("names") > -1) {
				let d = file.replace("_names", "");
				if (!allLinks[server].nameLinksSize[d]) return;
				diff = allLinks[server].nameLinksSize[d] - stats.size;
				if ((!forceUpdateMode && diff > 0) || (forceUpdateMode && diff !== 0)) {
					updateComplete = false;
					if (diff > 0) console.log("updating: "+server+" "+d+" -> missing "+bytesReadable(diff));
					else console.log("updating: "+server+" "+d+" -> too much "+bytesReadable(diff*-1));
					addToDownloadQueue(allLinks[server].nameLinks[d], filePath);
				}
			} else if (file.indexOf("curse") > -1) {
				if (!allLinks[server].curseLinksSize[file]) return;
				diff = allLinks[server].curseLinksSize[file] - stats.size;
				if ((!forceUpdateMode && diff > 0) || (forceUpdateMode && diff !== 0)) {
					updateComplete = false;
					if (diff > 0) console.log("updating: "+server+" "+file+" -> missing "+bytesReadable(diff));
					else console.log("updating: "+server+" "+file+" -> too much "+bytesReadable(diff*-1));
					addToDownloadQueue(allLinks[server].curseLinks[file], filePath);
				}
			} else {
				if (!allLinks[server].dateLinksSize[file]) return;
				diff = allLinks[server].dateLinksSize[file] - stats.size;
				if ((!forceUpdateMode && diff > 0) || (forceUpdateMode && diff !== 0)) {
					updateComplete = false;
					if (diff > 0) console.log("updating: "+server+" "+file+" -> missing "+bytesReadable(diff));
					else console.log("updating: "+server+" "+file+" -> too much "+bytesReadable(diff*-1));
					addToDownloadQueue(allLinks[server].dateLinks[file], filePath);
				}
			}
		});
	}
	if (updateComplete) keepUpdating = false;
}

function getTimeStr() {
	var date = new Date();
	var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var minute  = date.getMinutes();
    minute = (minute < 10 ? "0" : "") + minute;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
	return hour+":"+minute+":"+sec;
}

function isValidDate(date) {
	if (dateEqualsDate(date, date_begin) < 0) return false;
	if (dateEqualsDate(date, date_end) > 0) return false;
	return true;
}

// returns 0 if they are equal, 1 if dateA is bigger, -1 if dateA is smaller
// dateA = [ 2018, 11, 23 ]; // for example
function dateEqualsDate(dateA, dateB) {
	for (var d in dateA) {
		if (dateA[d] > dateB[d]) return 1;
		if (dateA[d] < dateB[d]) return -1;
	}
	return 0;
}

function getDateString(date) {
 	var str = "";
	str = date[0] + "_";
	if (date[1] < 10) str += 0;
	str += date[1] + "_";
	if (date[2] < 10) str += 0;
	str += date[2];
	return str;
}

function stringToDate(dateStr) {
	let splitted = dateStr.split('_');
	for (var i = 0; i < 3; i++) {
		splitted[i] = splitted[i].match(/[0-9]+/);
	}
	let date = [ parseInt(splitted[0]) , parseInt(splitted[1]) , parseInt(splitted[2]) ];
	return date;
}

const storageUnits = {
	'TB': 1000000000000,
	'GB': 1000000000,
	'MB': 1000000,
	'KB': 1000,
	'B': 1
}

function bytesReadable(bytes) {
	for (var s in storageUnits) {
		if (bytes >= storageUnits[s]) {
			return (bytes/storageUnits[s]).toFixed(2)+s;
		}
	}
	return bytes+"B";
}

