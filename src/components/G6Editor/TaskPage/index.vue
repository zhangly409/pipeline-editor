<template>
  <el-main v-if="status == 'node-selected'">
    <div id="task-page" class="task-page">
      <div id="task-graph-container" class="task-graph-container"></div>
    </div>
    <DetailPanelNew
      ref="detailPanel"
      :node="node"
    />
  </el-main>
</template>

<script>
import eventBus from '@/utils/eventBus'
import { textOverflow } from '@/utils/util'
import G6 from '@antv/g6'
import DetailPanelNew from '..//DetailPanelNew'

export default {
  components: {
    DetailPanelNew,
  },
  props: {
    node: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      status: 'canvas-selected',
      page: {},
      graph: null,
      item: {},
      app: {
        id: this.$route.query.appId,
        name: '',
      },
      stages: [],
      stage: {
        params: [],
        outputParams: [],
      },
      task: {},
      tasks: [],
      taskIndex: 0,
      pageId: 'task-graph-container',
      postTaskIdsMap: '',
      activeNodeIndex: 2,
    }
  },
  created() {
    this.bindEvent()
  },
  mounted() {
    this.$nextTick(() => {
      this.initTask()
    })
  },
  destroyed() {
    eventBus.$off('afterAddTaskPage')
    eventBus.$off('tasknodeselectchange')
  },
  methods: {
    bindEvent() {
      let self = this
      eventBus.$on('afterAddTaskPage', page => {
        self.page = page
        self.graph = self.page.graph
        eventBus.$on('tasknodeselectchange', item => {
          if (
            item.select === true &&
            item.target.getType() === 'node' &&
            item.target._cfg.id !== '-1' &&
            item.target._cfg.id !== '-2'
          ) {
            self.task = item.target._cfg.model.task || {}
            self.item = item.target
          } else {
            self.task = {}
            self.item = null
          }
        })
      })
    },
    initTask() {
      this.status = 'node-selected'
      let self = this
      if (this.node) {
        // 切换stage默认选中第一个任务
        self.node.tasks.length > 0 &&
          self.node.tasks.map((task, index) => {
            if (index == 0) {
              task.active = true
              this.taskIndex = 0
            } else {
              task.active = false
            }
          })
        self.stage = self._.cloneDeep(self.node)
        self.tasks = self.stage.tasks
        self.postTaskIdsMap = self._.cloneDeep(self.stage.postTaskIdsMap) || ''
        self.initGraph()
      }
    },
    initGraph() {
      let nodesData = []
      let edgesData = []
      let data = {}
      if (this.tasks.length == 0) {
        nodesData.push(
          {
            id: '-1',
            name: '开始',
            label: '开始',
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            scope: 'task',
          },
          {
            id: '-2',
            name: '结束',
            label: '结束',
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            scope: 'task',
          },
          {
            id: '0',
            name: 'task',
            label: 'task',
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            task: {
              id: '0',
              name: 'task',
              type: '',
           
              active: true,
              variableMap: {},
              outputVariableMap: {},
              params: [],
              outputParams: [],
              scope: 'task',
            },
          },
        )
        data = {
          nodes: nodesData,
          edges: [
            {
              source: '-1',
              target: '0',
            },
            {
              source: '0',
              target: '-2',
            },
          ],
        }
      } else {
        nodesData.push(
          {
            id: '-1',
            name: '开始',
            label: '开始',
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            scope: 'task',
          },
          {
            id: '-2',
            name: '结束',
            label: '结束',
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            scope: 'task',
          },
        )
        this.tasks.map(task => {
          task.labelFormat = textOverflow(task.name, 15)
          nodesData.push({
            id: task.id.toString(),
            name: task.name,
            label: task.labelFormat,
            size: [120, 34],
            type: 'node',
            shape: 'customNode',
            color: '#1890ff',
            inPoints: [[0, 0.5]],
            outPoints: [[1, 0.5]],
            task: task,
            scope: 'task',
          })
        })
        Object.keys(JSON.parse(this.postTaskIdsMap)).map(key => {
          JSON.parse(this.postTaskIdsMap)[key].map(node => {
            edgesData.push({
              source: key.toString(),
              target: node.toString(),
            })
          })
        })
        data = {
          nodes: nodesData,
          edges: edgesData,
        }
      }
      this.$nextTick(() => {
        this.readData(data)
      })
    },
    readData(data) {
      const container = document.getElementById('task-graph-container')
      const { taskEditor, taskCommand } = this.$parent.$parent.$parent
      let that = this
      if (this.graph) {
        that.graph.destroy()
      }
      let contextMenu = new G6.Menu({
        getContent() {
          return `<div style="cursor: pointer;color: #409EFF;font-weight: bold">复制节点</a>`
        },
        handleMenuClick: (target, item) => {
          let model = this._.cloneDeep(item.getModel())
          if (model.id === '-2' || model.id === '-2') {
            this.$message({
              type: 'warning',
              message: '开始/结束节点不支持复制',
            })
          } else {
            model.y = model.y + 40
            taskCommand.executeCommand('add', [model])
          }
        },
        offsetX: 16 + 10,
        offsetY: 0,
        itemTypes: ['node'],
      })
      this.graph = new G6.Graph({
        container: 'task-graph-container',
        width: container.offsetWidth == 0 ? 1680 : container.offsetWidth,
        height: 360,
        renderer: 'svg',
        plugins: [contextMenu],
        modes: {
          // 支持的 behavior
          default: [
            'hover-node',
            'select-node',
            'hover-edge',
            'keyboard',
            'customer-events',
            'drag-node',
            {
              type: 'tooltip',
              formatText: function formatText(model) {
                return model.name
              },
              shouldBegin: e => {
                if (
                  e.item.getModel().id !== '-1' &&
                  e.item.getModel().id !== '-2' &&
                  textOverflow(e.item.getModel().name, 15).indexOf('...') !== -1
                ) {
                  return true
                }
              },
              shouldUpdate: function shouldUpdate(e) {
                return true
              },
            },
          ],
          addEdge: ['add-edge'],
        },
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          nodesep: 20,
          ranksep: 40,
          controlPoints: true,
        },
        defaultEdge: {
          type: 'polyline',
          style: {
            endArrow: true,
            lineWidth: 1,
            stroke: '#606266',
            lineAppendWidth: 80,
          },
        },
        edgeStateStyles: {
          selected: {
            stroke: '#6ab7ff',
          },
          hover: {
            stroke: '#6ab7ff',
            lineWidth: 3,
            opacity: 0.6,
          },
        },
      })
      taskEditor.emit('afterAddTaskPage', {
        graph: this.graph,
        command: taskCommand,
        editor: taskEditor,
      })
      if (data) {
        this.graph.data(data)
        this.graph.render()
      }
      let item = this.graph.cfg.nodes[this.activeNodeIndex]
      this.graph.setItemState(item, 'selected', true)
      eventBus.$emit('tasknodeselectchange', { target: item, select: true })
      this.task = {}
    },
    saveTaskGraph() {
      return this.graph.save()
    },
  },
}
</script>

<style scoped>
.task-page {
  overflow: auto;
  height: 360px;
  width: 100%;
  background: #fff;
}
.detailpannel {
  height: 100%;
  position: absolute;
  right: 0px;
  z-index: 2;
  background: #f7f9fb;
  width: 38vw;
  border-left: 1px solid #e6e9ed;
  color: #303133;
  font-size: 12px;
  overflow-y: auto;
}
.detailpannel .block-container {
  padding: 16px 8px;
}
.block-container .el-col {
  height: 28px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.pannel-title {
  height: 32px;
  border-top: 1px solid #dce3e8;
  border-bottom: 1px solid #dce3e8;
  background: #ebeef2;
  color: #000;
  line-height: 28px;
  padding-left: 12px;
  font-size: 13px;
}
.task-input-add {
  width: 85%;
  text-align: left;
}

.task-input-add >>> .el-icon-plus {
  margin-right: 2%;
  cursor: pointer;
}

.task-input-add >>> .el-tooltip {
  font-size: 12px;
  color: #37cbc1;
  margin-left: 5px;
}

.task-input-add >>> span:first-child {
  font-size: 12px;
  color: #37cbc1;
  cursor: pointer;
}

.task-input-suffix {
  float: left;
  width: 100%;
  text-align: left;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  margin-right: 1%;
}

.task-input-suffix >>> .el-input {
  width: 40%;
}

.task-input-suffix >>> span {
  font-size: 12px !important;
  color: #f56c6c;
  margin-left: 4%;
  cursor: pointer;
}

.task-select-suffix {
  float: left;
  width: 100%;
  text-align: left;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}
.task-select-suffix >>> .el-select {
  width: 42%;
}
.task_form >>> .el-collapse-item__arrow {
  display: none;
}
.task_form >>> .el-collapse-item__header {
  font-size: 12px !important;
}
.task_form >>> .el-collapse-item__content {
  font-size: 12px !important;
}
.param_input {
  text-align: left;
  margin-left: 1%;
  margin-right: 2%;
  margin-bottom: 1%;
}
.el-input--small {
  font-size: 12px !important;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.inner_divider {
  margin: 10px 0 !important;
  width: 90% !important;
}
.task_collapse >>> .el-collapse-item__header {
  justify-content: space-between;
}
.date-radio >>> .el-radio__inner {
  width: 12px;
  height: 12px;
}
.date-radio >>> .el-radio__label {
  font-size: 12px;
}
.date-radio {
  margin-bottom: 2px;
}

.list-item {
  cursor: move;
}
.list-item i {
  cursor: pointer;
}
.flip-list-move {
  transition: transform 0.5s;
}
.ghost {
  opacity: 0.5;
  background: #f6faf2;
}
.chosen {
  border: 1px solid #dcdee3 !important;
  border-color: #37cbc1 !important;
}
.no-move {
  transition: transform 0s;
}
/* 设置滚动条的样式 */
.gray_table >>> ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.gray_table >>> ::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 12px;
}
.gray_table >>> ::-webkit-scrollbar-thumb {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
.gray_item >>> .el-form-item__label {
  text-align: right;
}
.gray_item >>> .el-form-item__content {
  margin-left: 2% !important;
  margin-right: 2%;
}
.gray_table >>> th:not(:last-child) .cell::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.sortable-container {
  display: flex;
  float: right;
  margin-right: 50px;
}
.sortable-container .task-index .item-order {
  height: 28px;
  line-height: 28px;
  margin: 6px 10px;
  position: relative;
  font-size: 13px;
}
.sortable-container .task-list .task-item {
  width: 100px;
  height: 26px;
  line-height: 26px;
  border: 1px solid #dcdee3;
  border-radius: 3px;
  padding: 0 30px 0 10px;
  margin: 6px 0;
  overflow: hidden;
  position: relative;
  font-size: 12px;
  /* 文本溢出省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sortable-container .task-list .task-item-add {
  width: 100px;
  line-height: 28px;
  border: 0px solid #dcdee3;
  border-radius: 3px;
  padding: 0 28px 0 10px;
  margin: 6px 0;
  overflow: hidden;
  position: relative;
  font-size: 12px;
}

.sortable-container .task-list .task-item.active {
  background-color: #37cbc1;
  border-color: #37cbc1;
  color: #fff;
}
.sortable-container .task-list .task-item i {
  position: absolute;
  right: 5px;
  top: 8px;
  cursor: pointer;
}
.el-cascader-panel {
  font-size: 13px;
  width: 100%;
}
.el-cascader-panel >>> .el-cascader-menu__wrap {
  height: 100%;
}
.el-cascader-panel >>> .el-cascader-menu {
  width: 50%;
}
.task-graph-container >>> .g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}

.task-graph-container {
  height: 100%;
  width: 100%;
  position: relative;
  font-size: 12px;
  color: #303133;
}
.task-graph-container >>> .g6-grid-container {
  z-index: 0 !important;
}
</style>
