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

    let response = await posts.fetch({require: false, withRelated: ['user']});

    res.send(response.toJSON());
  }

  async subscriptions(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return
    }

    let user = req.session.user
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('followers', 'followers.following_user_id', 'posts.user_id')
          .where('followers.user_id', '=', user.id)
          .orderBy('posts.created_at', 'desc')
      })

    let posts = await q.fetchAll({require: false, withRelated: ['user']})

    res.send(posts.toJSON());
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
      return
    } catch (e) {
      if (e.code == 23505) {
        res.status(401)
        res.send({error: 'User already exists'})
        return
      } else {
        console.dir(e)

        res.status(500);
        res.send({error: e.message})
        return
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

    let user

    try {
      user = await new User({username: req.body.username}).fetch({require: true});
    } catch (e) {
      console.log(`user '${req.body.username}' is not found`)
      res.status(401)
      res.send({success: false})
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(req.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.log(`password for user '${req.body.username}' is not found`)
      res.status(401)
      res.send({success: false})
      return
    }
    if (req.session) {
      req.session.user = user;
    }

    res.send({ success: true, user })
  }

  async whoAmI(req, res) {
  }

  async createPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    if (!('text' in req.body)) {
      res.status(400)
      res.send({error: '"text" parameter is not given'})
    }

    let Post = this.bookshelf.model('Post')

    let obj = new Post({
      id: uuid.v4(),
      text: req.body.text,
      user_id: req.session.user.id
    });

    try {
      await obj.save(null, {method: 'insert'});
      await obj.fetch({require: true, withRelated: ['user']})

      res.send(obj.toJSON());
    } catch (e) {
      res.status(500);
      res.send({error: e.message})
    }
  }

  async followUser(req, res) {
  }
}
