export default class ApiController {
  constructor (knex) {
    console.log('ApiController', this);
    this.knex = knex;
  }
  async test(req, res) {
    res.send({hello: 'world'});
  }

  async posts(req, res) {
    let response = await this.knex.select().table('posts');

    let posts = [
      {id: 1, userid: 1, text: 'Hello, world! This is my first post'},
      {id: 2, userid: 1, text: 'Hello, world! This is my second post'},
      {id: 3, userid: 1, text: 'Hello, world! This is my third post'},
    ];

    res.send(response)
  }

  async registerUser(req, res) {
  }

  async login(req, res) {
  }
}
