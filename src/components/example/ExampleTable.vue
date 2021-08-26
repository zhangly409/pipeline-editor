<template>
  <div>
    <basic-table
      :data="products"
      :config="[
        { prop: 'id', label: 'ID', sortable: true },
        { prop: 'title', label: '商品名', sortable: true },
        { prop: 'price', label: '价格', sortable: true },
        { prop: 'inventory', label: '数量', sortable: true },
        { prop: 'custom', label: '操作' },
      ]"
    >
      <template v-slot:custom="{ row }">
        <el-link type="danger" @click="handleDelete(row)">删除</el-link>
      </template>
    </basic-table>
  </div>
</template>

<script>
import BasicTable from '@/common/components/basic/BasicTable.vue'
import { deleteProduct } from '@/api/example.js'

export default {
  name: 'ExampleTable',
  components: { BasicTable },
  props: {},
  data() {
    return {}
  },
  computed: {
    // 计算属性，this.$store.state.products.productsList 更新时会自动更新
    products: function () {
      return this.$store.state.products.productsList
    },
  },
  created() {
    // 生命周期钩子函数，实例已经创建完成之后被调用
    this.$store.dispatch('products/getProductsList') // 发送 action, 触发 productsList 的更新
  },
  mounted() {},
  methods: {
    handleDelete(row) {
      deleteProduct(row.id).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功',
        })
        this.$store.dispatch('products/getProductsList')
      })
    },
  },
}
</script>
<style scoped></style>
