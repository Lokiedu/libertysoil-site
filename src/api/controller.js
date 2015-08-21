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

    res.send(response.toJSON())
  }

  async registerUser(req, res) {
  }

  async login(req, res) {
  }
}
