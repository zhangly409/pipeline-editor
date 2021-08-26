<template>
  <div id="mountNode" :style="{ width: width }">
    <el-card
      v-show="!isTaskViewShow"
      style="margin: 0px 0px 20px 0px; background-color: transparent"
      class="pipeline_card"
    >
      <div slot="header">
        <span style="font-size: 8px"><span style="font-weight: 600; float: left">阶段设置</span></span>
      </div>
      <div class="editor">
        <toolbar @generateGraphData="generateGraphData" />
        <div style="height: 42px"></div>
        <div class="bottom-container">
          <page ref="page" :height="height" :width="width" :data="data" @nodeChange="nodeChange" />
        </div>
        <Flow />
      </div>
      <div v-show="node" class="task" style="margin: 8px 0 20px 20px; text-align: left">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="taskEditDialogChange">任务设置</el-button>
      </div>
    </el-card>
    <div v-show="isTaskViewShow" class="editor" style="margin-bottom: 50px; border-bottom: 1px solid #e9e9e9">
      <ViewPage ref="viewpage" :is-task-view-show="isTaskViewShow" :width="width" />
      <Flow />
    </div>
    <!-- <el-dialog
      id="task_dialog"
      :title="stageName + ' — 任务设置'"
      width="80%"
      :visible.sync="taskEditDialogVisible"
      :modal-append-to-body="false"
      class="dialog"
      :close-on-click-modal="false"
    >
      <el-card v-if="taskEditDialogVisible" style="margin-top: 10px">
        <TaskToolbar />
        <div style="height: 42px"></div>
        <div class="bottom-container">
          <TaskPage
            ref="detailPanel"
            :project-members="projectMembers"
            :jigsaw-project-id="jigsawProjectId"
            :node="node"
          />
        </div>
        <Flow />
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button @click="taskEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTaskGraph">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import Toolbar from './Toolbar'
// import TaskToolbar from './TaskToolbar'
import Page from './Page'
import Flow from './Flow'
import Editor from './Base/Editor'
import command from './command'
// import TaskPage from '@/components/TaskPage'
import eventBus from '@/utils/eventBus'
import ViewPage from './ViewPage'
// import taskCommand from '@/taskCommand'
// import taskEditor from '@/components/Base/TaskEditor'

export default {
  name: 'G6Editor',
  components: {
    Toolbar,
    Page,
    Flow,
    // TaskPage,
    // TaskToolbar,
    ViewPage,
  },
  props: {
    height: {
      type: Number,
      default: document.documentElement.clientHeight,
    },
    width: {
      type: Number,
      default: document.documentElement.clientWidth,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      editor: {},
      command: null,
      node: null,
      taskEditDialogVisible: false,
      isTaskViewShow: false,
      stageName: '',
    }
  },
  created() {
    this.init()
    this.bindEvent()
  },
  destroyed() {
    eventBus.$off('afterAddPage')
    eventBus.$off('nodeselectchange')
  },
  methods: {
    bindEvent() {
      eventBus.$on('afterAddPage', page => {
        eventBus.$on('nodeselectchange', item => {
          if (
            item.select === true &&
            item.target.getType() === 'node' &&
            item.target._cfg.id !== 'node-1' &&
            item.target._cfg.id !== 'node-2' &&
            item.target._cfg.scope != 'task'
          ) {
            this.stageName = item.target.getModel().name
          } else {
            this.stageName = ''
          }
        })
      })
    },
    init() {
      this.editor = new Editor()
      this.command = new command(this.editor)
      // this.taskEditor = new taskEditor()
      // this.taskCommand = new taskCommand(this.taskEditor)
      let self = this
      eventBus.$on('taskViewSwitch', value => {
        self.isTaskViewShow = value.isTaskViewShow
      })
    },
    nodeChange(node) {
      this.node = node
    },
    taskEditDialogChange() {
      this.taskEditDialogVisible = true
    },
    saveTaskGraph() {
      let taskData = this.$refs.detailPanel.saveTaskGraph()
      if (this.$parent.graphRelationVerify(taskData).isRelationValid) {
        if (this.$refs.page.updateData(taskData)) {
          this.taskEditDialogVisible = false
        }
      }
    },
    generateGraphData(graphData) {
      this.$refs.viewpage.init(graphData)
    },
  },
}
</script>

<style scoped>
.editor {
  position: relative;
  width: 100%;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  height: 100%;
}
.bottom-container {
  position: relative;
  height: 100%;
}
.dialog >>> .el-dialog__title {
  font-size: 16px !important;
}
.dialog >>> .el-dialog__body .el-form >>> .el-form-item__label {
  font-size: 12px !important;
}
.dialog >>> .el-dialog__body {
  padding: 0 20px !important;
  text-align: left;
}
.pipeline_card >>> .el-card__header {
  height: 35px !important;
  padding: 10px 20px !important;
  border-bottom: none;
}
</style>
