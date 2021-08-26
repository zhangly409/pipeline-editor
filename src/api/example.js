/**
 * 存放单个module的api
 */
import axios from '@/common/api/request'

const getProducts = function () {
  return axios({
    url: '/mock/getProducts',
    method: 'get',
  })
}
const deleteProduct = function () {
  return axios({
    url: '/mock/deleteProducts',
    method: 'post',
  })
}

export { getProducts, deleteProduct }
