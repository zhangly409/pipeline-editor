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
  methods: {
    graphRelationVerify(graphInfo) {
      // 计算出图的 postStageTmpIdsMap
      let that = this
      let errMessage = ''
      let isRelationValid = true
      let postStageTmpIdsMap = {}
      let stagesData = []
      graphInfo.nodes.map((node, index) => {
        postStageTmpIdsMap[node.id] = []
        if (node.label !== '开始' && node.label !== '结束') {
          stagesData.push(node)
        }
      })
      Object.keys(postStageTmpIdsMap).map(postNode => {
        graphInfo.edges.map(edge => {
          if (edge.source == postNode) {
            postStageTmpIdsMap[postNode].push(edge.target)
          }
        })
      })
      // verify stage downstream and upstream none-empty
      let postStageTmpIdsArray = []
      Object.keys(postStageTmpIdsMap).some(key => {
        if (postStageTmpIdsMap[key].length == 0 && key.toString() !== '-2') {
          isRelationValid = false
          errMessage = errMessage + '除结束节点外，不允许存在其他节点无下游节点; '
          // that.$message.error("除结束节点外，不允许存在其他节点无下游节点; ");
          return true
        }
        postStageTmpIdsArray = postStageTmpIdsArray.concat(postStageTmpIdsMap[key])
      })
      postStageTmpIdsArray = that.unique(postStageTmpIdsArray)
      if (postStageTmpIdsArray.length !== graphInfo.nodes.length - 1) {
        isRelationValid = false
        errMessage = errMessage + '除开始节点外，不允许存在其他节点无上游节点; '
        // that.$message.error("除开始节点外，不允许存在其他节点无上游节点");
      }
      if (!isRelationValid) {
        that.$message.error({ message: errMessage, duration: 6000 })
      }
      return { isRelationValid: isRelationValid, stagesData: stagesData }
    },
    unique(array) {
      var res = array.filter(function (item, index, array) {
        return array.indexOf(item) === index
      })
      return res
    },
    taskVerify(task, index, tasks) {
      let that = this
      let isTaskFormValid = true
      if (task.name == '') {
        task.name = that.TASK_TYPES[task.type].label
      }
      // task variable data format
      let variableMapForTask = {},
        outputVariableMapForTask = {}
      task.showOrder = 0
      task.params.map(param => {
        variableMapForTask[param.key] = param.value
      })
      task.variableMap = variableMapForTask
      task.outputParams.map(param => {
        outputVariableMapForTask[param.key] = param.value
      })
      task.outputVariableMap = outputVariableMapForTask
      return { isTaskFormValid: isTaskFormValid, tasks: tasks }
    },
  },
}
</script>
<style scoped></style>
