var discord = require("discord.js");
var client = new discord.Client();
var sql = require('mysql');
var userCount = 0;
var users = [];
var voiceChatOne = "297863449739001857";
var voiceChatTwo = "514623214903623680";
var possibleRoles = ["Top", "Mid", "ADC", "Jungle", "Support"];

var connection = sql.createConnection({
	host: '<hostIP>',
	user: 'user',
	password: 'main',
	database: 'LoL'
});

connection.connect();

client.on('ready', () => {
	connection.query("SELECT count(UserID) AS totalUsers From Users;", function (err, result) {
		if (err) {
			throw err;
		}
		client.channels.find("name", "botspam").send(`There are currently ${result[0].totalUsers} users in the database.`);
	});
});

client.on("message", (message) => {

	args = message.content.slice(1).trim().split(/ +/g);
	command = args.shift().toLowerCase();

	if (message.author.bot) {
		return;
	}

	if (message.content.indexOf("!") !== 0) {
		return;
	}

	switch (command) {
		case "ready":
			ready(message);
			break;

		case "leave":
			leave(message);
			break;

		case "start":
			switch (args[0]) {
				case "random":
					startRandom();
					break;

				case "organized":
					startOrganized();
					break;
			}
			break;

		case "shutdown":
			shutdown();
			break;

		case "status":
			status();
			break;

		case "myroles":
			myRoles(message, args);
			break;

		case "roles":
			switch (args[0]) {
				case "show":
					switch (args[1]) {
						case "all":
							allRoles();
							break;

						default:
							roles(args[1]);
							break;
					}
					break;

				case "delete":
					switch (args[1]) {
						case "all":
							deleteAllRoles();
							break;

						default:
							deleteRole(args[1]);
							break;
					}
					break;

				default:
					break;
			}
			break;

		case "help":
			showHelp();
			break;

		case "notice":
			switch (args[0]) {
				case "voice":
					noticeVoice();
					break;

				case "ready":
					noticeReady();
					break;
			}
			break;
	}
});

function startOrganized() {
	connection.query(
		`SELECT Name, PrimaryRole, SecondaryRole, TertiaryRole FROM Users WHERE UserID = '${users.substr(3).replace(/>/g, '')};`,
		function (err, result) {
			//try {
				if (err) {
					throw err;
				}
				var endString = `\n${result[0].Name}: ${result[0].PrimaryRole}, ${result[0].SecondaryRole}, ${result[0].TertiaryRole}`;
				client.channels.find("name", "botspam").send(endString);
			//}
			//catch (e) {
				//client.channels.find("name", "botspam").send(`Can't find in the database!`);
			//}
		});
}

function startRandom() {
	if (userCount === 10) {
		for (var i = 0; i < users.length; i++) {
			var rand = Math.floor((Math.random() * 2) + 1);
			if (client.channels.find("name", "Crew").members.length <= 4) {
				if (rand === 1) {
					users[i].setVoiceChannel(voiceChatOne);
				}
				else if (rand === 2) {
					users[i].setVoiceChannel(voiceChatTwo);
				}
			}
			else if (!client.channels.find("name", "bottest").members.length <= 4) {
				if (rand === 1) {
					users[i].setVoiceChannel(voiceChatOne);
				}
				else if (rand === 2) {
					users[i].setVoiceChannel(voiceChatTwo);
				}
			}
		}
		client.channels.find("name", "botspam").send("Let the games begin!");
	}
	else {
		message.channel.send("There are not enough players, " + message.member + "!");
	}
}

function status() {
	client.channels.find("name", "botspam").send("There are currently " + userCount + "/10 users ready!");
}

function leave(message) {
	if (users.includes(message.member)) {
		userCount--;
		users.pop(message.member);
		message.channel.send(message.member + " left the queue! There are currently " + userCount + "/10 users ready!");
	}
	else {
		message.channel.send("You're not in the queue " + message.member + "!");
	}
}

function noticeReady() {
	var notReady = [];
	var channelMembers = client.channels.find("name", "Crew").members.map(member => member.user);
	if (channelMembers.length > 0) {
		for (var i = 0; i < channelMembers.length; i++) {
			if (!users.map(member => member.user).includes(channelMembers[i])) {
				notReady += channelMembers[i];
			}
		}
		if (notReady.length > 0) {
			client.channels.find("name", "botspam").send(`${notReady}, please type "!ready" so the game can start.`);
		}
		else {
			client.channels.find("name", "botspam").send(`Everyone is already ready you actual dumb piece of-`);
		}
	}
	else {
		client.channels.find("name", "botspam").send(`Nobody is in the voice channel!`);
	}
}

function noticeVoice() {
	var notInVoice = [];
	if (users.length === 0) {
		client.channels.find("name", "botspam").send(`No one is ready to play.`);
	}
	else {
		for (var i = 0; i < users.length; i++) {
			try {
				if (users[i].voiceChannel.name !== "Crew") {
					notInVoice += users[i];
				}
			}
			catch (e) {
				notInVoice += users[i];
			}
		}
		if (notInVoice.length > 0) {
			client.channels.find("name", "botspam").send(`${notInVoice}, please join the "Waiting Room" voice channel so the game can start.`);
		}
		else {
			client.channels.find("name", "botspam").send(`Everyone is already in the "Waiting Room" voice channel you actual dumb piece of-`);
		}
	}
}

function showHelp() {
	client.channels.find("name", "botspam").send("\`\`\`" +
		"\nScrimBot is a bot created specifically for the LoL Customs Server." +
		"\nIts function is to organize teams, start and end games, and store user data for an overall unique experience." +
		"\nPlease report any glitches or bugs to @Align." +
		"\n" +
		"\n!roles show <@discord user>  || Shows the roles of the mentioned user" +
		"\n!roles show all              || Shows all users from the database and their roles" +
		"\n!roles delete all            || <Admin Only> Delete all entries in the database" +
		"\n!roles delete <@discord user || Deletes yourself from the database (or a user if used by an Admin)" +
		"\n!myroles <1>, <2>, <3>       || Adds/Updates your roles in the database" +
		"\n!ready                       || Let's the bot know you're ready to begin the custom game" +
		"\n!notice voice                || Notifies everyone in the ready list that isn't in the \"Waiting Room\" voice channel to get in there" +
		"\n!notice ready                || Notifies everyone in the \"Waiting Room\" voice channel that isn't in the ready list to type !ready" +
		"\n!leave                       || Removes you from the ready queue" +
		"\n!start random                || Begins the game by moving everyone into their teams based on a random number generator" +
		"\n\`\`\`");
}

function roles(name) {
	connection.query(
		`SELECT Name, PrimaryRole, SecondaryRole, TertiaryRole FROM Users WHERE UserID = '${name.substr(3).replace(/>/g, '')}';`,
		function (err, result) {
			try {
				if (err) {
					throw err;
				}
				var endString = `\n${result[0].Name}: ${result[0].PrimaryRole}, ${result[0].SecondaryRole}, ${result[0].TertiaryRole}`;
				client.channels.find("name", "botspam").send(endString);
			}
			catch (e) {
				client.channels.find("name", "botspam").send(`Can't find ${name} in the database!`);
			}

		});
}

function myRoles(message, args) {
	if (args.length === 3) {
		if (possibleRoles.indexOf(args[0]) > -1 && possibleRoles.indexOf(args[1]) > -1 && possibleRoles.indexOf(args[2]) > -1) {
			connection.query(
				`SELECT UserID FROM Users WHERE UserID = '${message.author.id}'`,
				function (err, result) {
					if (err) {
						throw err;
					}
					else if (result.length === 0) {
						connection.query(
							"INSERT INTO Users (UserID, Name, PrimaryRole, SecondaryRole, TertiaryRole)" +
							`VALUES ('${message.author.id}', '${message.member.displayName}', '${args[0]}', '${args[1]}', '${args[2]}');`,
							function (err) {
								if (err) {
									throw err;
								}
								client.channels.get("505213134835810325").send(`Congrats! You're now in the database ${message.member}.`);
							});
					}
					else if (result.length === 1) {
						connection.query(
							`UPDATE Users SET Name = '${message.member.displayName}', PrimaryRole = '${args[0]}', SecondaryRole = '${args[1]}', TertiaryRole = '${args[2]}' WHERE UserID = '${message.author.id}';`,
							function (err) {
								if (err) {
									throw err;
								}
								client.channels.get("505213134835810325").send(`Your roles have been updated, ${message.member}.`);
							});
					}
				}
			)
		}
		else {
			client.channels.get("505213134835810325").send(`Please use the available roles: Top, Mid, ADC, Jungle, Support, ${message.member}.`);
		}
	}
	else {
		message.channel.send("You must provide three roles " + message.member + "!\n It must be formatted like so: \"!myroles Top Mid ADC\"");
	}
}

function deleteAllRoles() {
	connection.query(
		"DELETE FROM Users;",
		function (err, result) {
			if (err) {
				throw err;
			}
			client.channels.get("505213134835810325").send("Everything was deleted!");
		});
}

function allRoles() {
	connection.query(
		"SELECT * FROM Users;",
		function (err, result) {
			if (err) {
				throw err;
			}
			var totalResult = "These are all the roles in the database:";
			for (var i = 0; i < result.length; i++) {
				var tempResult = `\n${result[i].Name}: ${result[i].PrimaryRole}, ${result[i].SecondaryRole}, ${result[i].TertiaryRole}`;
				totalResult += tempResult;
			}
			client.channels.find("name", "botspam").send(totalResult);
		});
}

function ready(message) {
	if (userCount <= 9) {
		if (!users.includes(message.member)) {
			userCount++;
			users.push(message.member);
			message.channel.send(message.member + " is ready! There are currently " + userCount + "/10 users ready!");
		}
		else {
			message.channel.send("You're already in the queue " + message.member + "!");
		}
	}
	else {
		message.channel.send("The queue is already full " + message.member + "!");
	}
}

function shutdown() {
	client.destroy();
}

client.login("<secret>");