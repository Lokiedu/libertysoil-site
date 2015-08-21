import _ from 'lodash'
import bcrypt from 'bcrypt'
import bb from 'bluebird'
import uuid from 'uuid'

let bcryptAsync = bb.promisifyAll(bcrypt);

export default class ApiController {
  constructor (bookshelf) {
    this.bookshelf = bookshelf;
  }

  async test(req, res) {
    res.send({hello: 'world'});
  }

  async posts(req, res) {
    let Posts = this.bookshelf.collection('Posts');
    let posts = new Posts();

    let response = await posts.fetch({require: false});

    res.send(response.toJSON());
  }

  async registerUser(req, res) {
    let requiredFields = ['username', 'password', 'email'];
    let optionalFields = ['firstName', 'lastName'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return
      }
    }

    let hashedPassword = await bcryptAsync.hashAsync(req.body.password, 10);

    let User = this.bookshelf.model('User');

    let obj = new User({
      id: uuid.v4(),
      username: req.body.username,
      hashed_password: hashedPassword,
      email: req.body.email
    });

    let moreData = {};
    for (let fieldName of optionalFields) {
      if (fieldName in req.body) {
        moreData[fieldName] = req.body[fieldName];
      }
    }

    if (!_.isEmpty(moreData)) {
      obj.set('more', moreData);
    }

    try {
      await obj.save(null, {method: 'insert'});
      res.send(obj.toJSON());
    } catch (e) {
      if (e.code == 23505) {
        res.status(401)
        res.send({error: 'User already exists'})
      } else {
        console.dir(e)

        res.status(500);
        res.send({error: e.message})
      }
    }
  }

  async login(req, res) {
    let requiredFields = ['username', 'password'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return
      }
    }

    let User = this.bookshelf.model('User');
    let user = await new User({username: req.body.username}).fetch({require: true});

    let passwordIsValid = await bcryptAsync.compareAsync(user.get('hashed_password'), password);

    res.send({success: passwordIsValid})
  }
}
