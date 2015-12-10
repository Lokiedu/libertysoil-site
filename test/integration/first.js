import bb from 'bluebird';

describe('promise Test', function() {

  describe('new Promise', function() {

    let f = () => {
      return new bb((resolve, reject) => {
        return resolve();
      });
    };

    it('should not fail on await keyword', async function() {
      let client = await f();
    });

  });

});
