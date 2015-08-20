
export default class ApiController {
  async test(req, res, next) {
    res.send({hello: 'world'});
    next();
  }
}
