var Mock = require('mockjs')
module.exports = {
  getProducts: Mock.mock({
    error: 0,
    code: 200,
    msg: 'success',
    result: {
      1: {
        title: 'iPad 4 Mini',
        price: 500.01,
        inventory: 2,
      },
      2: {
        title: 'H&M T-Shirt White',
        price: 10.99,
        inventory: 10,
      },
      3: {
        title: 'Charli XCX - Sucker CD',
        price: 19.99,
        inventory: 5,
      },
    },
  }),
  deleteProducts: Mock.mock({
    error: 0,
    msg: 'success',
    code: 204,
    result: {},
  }),
}
