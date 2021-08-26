<template>
  <div>
    <div id="page" class="page">
      <div :id="pageId" class="graph-container"></div>
    </div>
    <div v-if="node" :model="node" class="stage_form">
      <el-input
        v-model="node.name"
        style="margin-top: 20px; margin-bottom: 20px; width: 40%"
        @input.native="handleChangeName($event)"
      >
        <template slot="prepend">阶段名称</template>
      </el-input>

      <el-row style="margin-right: 0" :gutter="40">
        <el-col :span="12">
          <el-collapse class="stage_collapse">
            <el-collapse-item title="阶段输入变量 (单击展开/收起)" name="1">
              <div
                v-for="(param, index) in node.params"
                v-show="!isParamsCollapse"
                :key="index"
                class="task-input-suffix"
              >
                <el-input v-model="param.key" placeholder="变量名" size="mini" @input="change($event)"></el-input>
                &nbsp;=&nbsp;
                <el-input v-model="param.value" placeholder="变量值" size="mini" @input="change($event)"></el-input>
                <span @click="deleteParam(index, 'input')">删除</span>
              </div>
              <div v-show="!isParamsCollapse" class="task-input-add">
                <span @click="addParam('input')"> <i class="el-icon-plus"></i>添加变量 </span>
                <el-tooltip
                  class="item"
                  content="可被本阶段所有任务共享。支持通过 ${XX} 格式注入变量。"
                  placement="right"
                  effect="dark"
                >
                  <span>
                    <i class="el-icon-question"></i>
                  </span>
                </el-tooltip>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-col>
        <el-col :span="12" style="border-left: 1px dashed rgb(196, 198, 207)">
          <el-collapse class="stage_collapse">
            <el-collapse-item title="阶段输出变量 (单击展开/收起)" name="1">
              <div
                v-for="(param, index) in node.outputParams"
                v-show="!isOutputParamsCollapse"
                :key="index"
                class="task-input-suffix"
              >
                <el-input v-model="param.key" placeholder="变量名" size="mini" @input="change($event)"></el-input>
                &nbsp;=&nbsp;
                <el-input v-model="param.value" placeholder="变量值" size="mini" @input="change($event)"></el-input>
                <span @click="deleteParam(index, 'output')">删除</span>
              </div>
              <div v-show="!isOutputParamsCollapse" class="task-input-add">
                <span @click="addParam('output')"> <i class="el-icon-plus"></i>添加变量 </span>
                <el-tooltip
                  class="item"
                  content="阶段执行成功后，加入流水线全局变量，后续阶段均可使用。支持通过 ${XX} 格式注入变量。"
                  placement="right"
                  effect="dark"
                >
                  <span>
                    <i class="el-icon-question"></i>
                  </span>
                </el-tooltip>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import { initBehavors } from '../behavior'
import axios from 'axios'
import eventBus from '@/utils/eventBus'
import { textOverflow } from '@/utils/util'

export default {
  components: {},
  props: {
    height: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    data: {
      type: Object,
      default: () => {},
    },
    projectMembers: {
      type: Array,
      default: () => {},
    },
    qcdPipelinesOfJigsawProject: {
      type: Array,
      default: () => {},
    },
    jigsawProjectId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      pageId: 'graph-container',
      graph: null,
      stages: [],
      pipeline: {
        id: this.$route.query.pipelineId,
        copyflag: this.$route.query.copyflag ? this.$route.query.copyflag : false,
      },
      postNodesMap: {},
      nodesData: [],
      page: null,
      command: null,
      activeNodeIndex: 2,
      maxLevel: 0,
      latestItem: {},
      item: null,
      node: null,
      status: 'canvas-selected',
      taskEditor: {},
      taskCommand: null,
      taskNodesState: [],
      taskEdgesState: [],
      stageNodesState: [],
      stageEdgesState: [],
      stagesObject: {},
      isParamsCollapse: false,
      isOutputParamsCollapse: false,
    }
  },
  created() {
    initBehavors()
    this.bindEvent()
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    bindEvent() {
      eventBus.$on('afterAddPage', page => {
        this.page = page
        this.command = page.command
        this.graph = this.page.graph
        eventBus.$on('nodeselectchange', item => {
          if (
            item.select === true &&
            item.target.getType() === 'node' &&
            item.target._cfg.id !== 'node-1' &&
            item.target._cfg.id !== 'node-2' &&
            item.target._cfg.scope != 'task'
          ) {
            this.status = 'node-selected'
            this.item = item.target
            this.node = item.target.getModel()
            this.stage = this._.cloneDeep(self.node)
            this.$emit('nodeChange', this.node)
          } else {
            this.status = 'canvas-selected'
            this.item = null
            this.node = null
            this.$emit('nodeChange', this.node)
          }
        })
      })
    },
    init() {   
      this.emptyInit()
    },
    emptyInit() {
      this.stageNodesState.push(
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
        },
        {
          id: '0',
          name: 'stage',
          label: 'stage',
          size: [120, 34],
          type: 'node',
          shape: 'customNode',
          color: '#1890ff',
          inPoints: [[0, 0.5]],
          outPoints: [[1, 0.5]],
          outputParams: [],
          params: [],
          tasks: [
            {
              id: '0',
              name: 'task',
              type: '',
              active: true,
              variableMap: {},
              outputVariableMap: {},
              params: [],
              outputParams: [],
            },
          ],
          postTaskIdsMap: JSON.stringify({ '-1': ['0'], 0: ['-2'], '-2': [] }),
        },
      )
      this.stageEdgesState.push(
        {
          source: '-1',
          target: '0',
        },
        {
          source: '0',
          target: '-2',
        },
      )
      let data = {
        nodes: this.stageNodesState,
        edges: this.stageEdgesState,
      }
      this.readData(data)
    },
    updateData(taskData) {
      let postTaskIdsMap = {}
      let tasks = []
      taskData.nodes.map(node => {
        if (node.id != '-1' && node.id != '-2') {
          node.task.id = node.id
          tasks.push(node.task)
        }
        postTaskIdsMap[node.id.toString()] = []
      })
      taskData.edges.map(edge => {
        Object.keys(postTaskIdsMap).map(key => {
          if (edge.source == key) {
            postTaskIdsMap[key].push(edge.target)
          }
        })
      })
      // update对象属性时不能直接赋值，这里将对象转换成JSON字符串
      let model = {
        tasks: tasks,
        postTaskIdsMap: JSON.stringify(postTaskIdsMap),
      }
      let tasksVerify = this._.cloneDeep(tasks)
      let isTaskFormValid = true
      // 这里只做校验，不改变tasks值,tasks值的格式化统一在保存时处理
      tasksVerify.forEach((task, index, tasks) => {
        let tasksVerifyResult = this.$parent.$parent.$parent.taskVerify(task, index, tasks)
        if (tasksVerifyResult.isTaskFormValid == false) {
          isTaskFormValid = tasksVerifyResult.isTaskFormValid
        }
      })
      if (isTaskFormValid) {
        this.graph.update(this.item, model)
        this.$message({ message: '任务设置成功！', type: 'success' })
        return true
      } else {
        return false
      }
    },
    readData(data) {
      let container = document.getElementById('graph-container')
      let grid = new G6.Grid()
      const { editor, command } = this.$parent.$parent
      if (this.graph) {
        this.graph.clear()
      } else {
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
              command.executeCommand('add', [model])
            }
          },
          offsetX: 16 + 10,
          offsetY: 0,
          itemTypes: ['node'],
        })
        this.graph = new G6.Graph({
          container: 'graph-container',
          width: container.offsetWidth,
          height: 360,
          plugins: [grid, contextMenu],
          renderer: 'svg',
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
            mulitSelect: ['mulit-select'],
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
              stroke: '#303133',
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
      }

      editor.emit('afterAddPage', { graph: this.graph, command })
      if (data) {
        this.graph.data(data)
        this.graph.render()
      }
      let item = this.graph.cfg.nodes[this.activeNodeIndex]
      this.graph.setItemState(item, 'selected', true)
      eventBus.$emit('nodeselectchange', { target: item, select: true })
    },
    handleChangeName(e) {
      let labelFormat = textOverflow(e.target.value, 15)
      const model = {
        label: labelFormat,
        name: e.target.value,
      }
      this.graph.update(this.item, model)
    },
    change() {
      this.$forceUpdate()
    },
    addParam(type) {
      if (type == 'input') {
        this.node.params.push({ key: '', value: '' })
        const model = {
          params: this.node.params,
        }
        this.graph.update(this.item, model)
      } else if (type == 'output') {
        this.node.outputParams.push({ key: '', value: '' })
        const model = {
          outputParams: this.node.outputParams,
        }
        this.graph.update(this.item, model)
      }
      this.$forceUpdate()
    },
    deleteParam(index, type) {
      if (type == 'input') {
        this.node.params.splice(index, 1)
        const model = {
          params: this.node.params,
        }
        this.graph.update(this.item, model)
      } else if (type == 'output') {
        this.node.outputParams.splice(index, 1)
        const model = {
          outputParams: this.node.outputParams,
        }
        this.graph.update(this.item, model)
      }
      this.$forceUpdate()
    },
    handleChangeCollapse(type) {
      if (type == 'param') {
        this.isParamsCollapse = !this.isParamsCollapse
      } else if (type == 'outputparam') {
        this.isOutputParamsCollapse = !this.isOutputParamsCollapse
      }
    },
  },
}
</script>

<style scoped>
.page {
  overflow: auto;
  height: 360px;
  width: 100%;
  border-bottom: 1px solid #e9e9e9;
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}

.graph-container >>> .g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}

.graph-container {
  height: 100%;
  width: 100%;
  position: relative;
  font-size: 12px;
  color: #303133;
}
.stage_form {
  width: 100%;
  margin: 20px 10px;
  font-size: 14px;
  text-align: left;
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
.stage_collapse >>> .el-collapse-item__header {
  padding-left: 10px;
  height: 35px;
}
.stage_collapse >>> .el-collapse-item__content {
  padding-left: 10px;
}
</style>
