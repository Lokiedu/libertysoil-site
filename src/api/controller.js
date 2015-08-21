export default class ApiController {
  constructor (bookshelf) {
    this.knex = bookshelf.knex;
  }

  async test(req, res) {
    res.send({hello: 'world'});
  }

  async posts(req, res) {
    let response = await this.knex.select().table('posts');
    res.send(response)
  }

  async registerUser(req, res) {
  }

  async login(req, res) {
  }
}
