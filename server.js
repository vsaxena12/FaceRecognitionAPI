const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
/*
const app = express()

*/

const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smart_brain'
  }
});

db.select('*').from('users').then(data => {
  console.log(data);
});

const app = express();


app.use(bodyParser.json());
app.use(cors());

/*
const database = {
	users: [
		{
		    id: '123',
		    name: 'John',
		    email: 'john@gmail.com',
		    password: 'cookies',
		    entries: 0,
		    joined: new Date()
  		},
  		{
  			id: '124',
		    name: 'Sally',
		    email: 'sally@gmail.com',
		    password: 'bananas',
		    entries: 0,
		    joined: new Date()

  		}
  	],
  	login:[
  		{
  			id: '987',
  			hash: '',
  			email: 'john@gmail.com'
  		}
  	]
}
*/

app.get('/',(req, res) => {
	//res.send('this is working!');

	res.send(database.users);
})

app.post('/signin',(req,res)=>{
	/*
  if(req.body.email === database.users[0].email && 
		req.body.password === database.users[0].password){
		res.json(database.users[0]);	
	}
	else{
		res.status(400).json('Error Login in');
	}
  */
  db.select('email','hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    
    if(isValid){
      return db.select('*').from('users')
      .where('email', '=', req.body.email)
      .then(user => {
        res.json(user[0])  
      })
      .catch(err => res.status(400).json('unable to get user'))
    }else{
        res.status(400).json('wrong credentials');
    }

  })
	.catch(err => res.status(400).json('wrong details'))
})


app.post('/register',(req,res)=>{
	const {email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()

              }).then(user => {
                res.json(user[0]);  
            })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
  
  .catch(err=>res.status(400).json('unable to join'))

})


app.get('/profile/:id', (req, res) => {
  const{ id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
    	found = true;
      return res.json(user);
    }
  })
  // res.json('no user')
  if(!found){
  	res.status(400).json('not found');
  }
})

app.put('/image',(req,res) =>{
	const{  id } = req.body;
  	/*
    let found = false;
  	database.users.forEach(user => {
    	if (user.id === id) {
    		found = true;
    		user.entries++;
      		return res.json(user.entries);
    	}
  	})

  	if(!found){
  		res.status(400).json('not found');
  	}	
    */
    db('users').where('id','=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('No update count'));
})

/*
bcrypt.hash(password, null, null, function(err, hash) {
    	console.log(hash);
});
*/
/*
// Load hash from your password DB.
bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});

bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});
*/



app.listen(3001, () => console.log('app is running on port 3001 '))


/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/

/*

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var cors = require('cors')

const database = {
  users: [{
    id: '123',
    name: 'Andrei',
    email: 'john@gmail.com',
    entries: 0,
    joined: new Date()
  }],
  secrets: {
    users_id: '123',
    hash: 'wghhh'
  }
}

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'))

app.post('/signin', (req, res) => {
  var a = JSON.parse(req.body);
  if (a.username === database.users[0].email && a.password === database.secrets.hash) {
    res.send('signed in');
  } else {
    res.json('access denied');
  }
})

app.post('/findface', (req, res) => {
  database.users.forEach(user => {
    if (user.email === req.body.email) {
      user.entries++
      res.json(user)
    }
  });
  res.json('nope')
})


app.post('/register', (req, res) => {
  database.users.push({
    id: '124',
    name: req.body.name,
    email: req.body.email,
    entries: 0,
    joined: new Date()
  })
  res.json(database.users[database.users.length - 1])
})

app.get('/profile/:userId', (req, res) => {
  database.users.forEach(user => {
    if (user.id === req.params.userId) {
      return res.json(user);
    }
  })
  // res.json('no user')

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))


*/