<template>
  <div> <G6Editor
      mode="edit"
      :parent="this"
    ></G6Editor></div>
</template>

<script>
import G6Editor from '@/components/G6Editor'
export default {
  name: 'Example',
  components: { G6Editor },
  props: {},
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>
<style scoped></style>
