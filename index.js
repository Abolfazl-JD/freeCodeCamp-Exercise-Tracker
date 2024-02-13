const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

//* Middleware

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//* Local data arrays

let users = [];
let exercises = [];

//* Endpoints

/*
 * GET
 * Delete all users
 */
app.get('/api/users/delete', function (_req, res) {
	console.log('### delete all users ###'.toLocaleUpperCase());

	users = [];

	res.json({ message: 'All users have been deleted!' });
});

/*
 * GET
 * Delete all exercises
 */
app.get('/api/exercises/delete', function (_req, res) {
	console.log('### delete all exercises ###'.toLocaleUpperCase());

	exercises = [];

	res.json({ message: 'All exercises have been deleted!' });
});

app.get('/', async (_req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

/*
 * GET
 * Get all users
 */
app.get('/api/users', function (_req, res) {
	console.log('### get all users ###'.toLocaleUpperCase());

	if (users.length === 0) {
		res.json({ message: 'There are no users in the database!' });
	}

	console.log('users in database: '.toLocaleUpperCase() + users.length);

	res.json(users);
});

/*
 * POST
 * Create a new user
 */
app.post('/api/users', function (req, res) {
	const inputUsername = req.body.username;

	console.log('### create a new user ###'.toLocaleUpperCase());

	//? Create a new user
	let newUser = { username: inputUsername, _id: users.length + 1 };

	console.log(
		'creating a new user with username - '.toLocaleUpperCase() + inputUsername
	);

	users.push(newUser);

	res.json(newUser);
});

/*
 * POST
 * Add a new exercise
 * @param _id
 */
app.post('/api/users/:_id/exercises', function (req, res) {
	var userId = req.params._id;
	var description = req.body.description;
	var duration = req.body.duration;
	var date = req.body.date;

	console.log('### add a new exercise ###'.toLocaleUpperCase());

	//? Check for date
	if (!date) {
		date = new Date().toISOString().substring(0, 10);
	}

	console.log(
		'looking for user with id ['.toLocaleUpperCase() + userId + '] ...'
	);

	let userInDb = users.find(user => user._id === Number(userId));

	if (!userInDb) {
		res.json({ message: 'There are no users with that ID in the database!' });
		return;
	}

	//* Create new exercise
	let newExercise = {
		userId: userInDb._id,
		username: userInDb.username,
		description: description,
		duration: parseInt(duration),
		date: date,
	};

	exercises.push(newExercise);

	res.json({
		username: userInDb.username,
		description: newExercise.description,
		duration: newExercise.duration,
		date: new Date(newExercise.date).toDateString(),
		_id: userInDb._id,
	});
});

/*
 * GET
 * Get a user's exercise log
 * @param _id
 */
app.get('/api/users/:_id/logs', async function (req, res) {
	const userId = req.params._id;
	const from = req.query.from || new Date(0).toISOString().substring(0, 10);
	const to =
		req.query.to || new Date(Date.now()).toISOString().substring(0, 10);
	const limit = Number(req.query.limit) || 0;

	console.log('### get the log from a user ###'.toLocaleUpperCase());

	let user = users.find(user => user._id === Number(userId));

	if (!user) {
		res.json({ message: 'There are no users with that ID in the database!' });
		return;
	}

	console.log(
		'looking for exercises with id ['.toLocaleUpperCase() + userId + '] ...'
	);

	let userExercises = exercises.filter(exercise => exercise.userId === Number(userId) && exercise.date >= from && exercise.date <= to);

	let parsedDatesLog = userExercises.map((exercise) => {
		return {
			description: exercise.description,
			duration: exercise.duration,
			date: new Date(exercise.date).toDateString(),
		};
	});

	res.json({
		_id: user._id,
		username: user.username,
		count: parsedDatesLog.length,
		log: parsedDatesLog,
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});
