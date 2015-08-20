
export default class ApiController {
  async test(req, res) {
    res.send({hello: 'world'});
  }
}
