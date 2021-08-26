<template>
  <div class="toolbar">
    <i
      class="command iconfont icon-undo"
      title="撤销"
      :class="undoList.length > 0 ? '' : 'disable'"
      @click="handleUndo"
    ></i>
    <i
      class="command iconfont icon-redo"
      title="重做"
      :class="redoList.length > 0 ? '' : 'disable'"
      @click="handleRedo"
    ></i>
    <span class="separator"></span>
    <i
      data-command="delete"
      class="command iconfont icon-delete-o"
      title="删除"
      :class="selectedItem && notStartItem ? '' : 'disable'"
      @click="handleDelete(selectedItem && notStartItem)"
    ></i>
    <span class="separator"></span>
    <i data-command="zoomIn" class="command iconfont icon-zoom-in-o" title="放大" @click="handleZoomIn"></i>
    <i data-command="zoomOut" class="command iconfont icon-zoom-out-o" title="缩小" @click="handleZoomOut"></i>
    <span class="separator"></span>
    <el-button type="primary" size="mini" @click="addNode">添加任务节点</el-button>
    <span class="separator"></span>
    <el-button-group>
      <el-button type="primary" icon="el-icon-minus" size="mini" @click="widthMini"></el-button>
      <el-button size="mini" class="disable" style="color: #606266">画布宽度</el-button>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="widthExtend"></el-button>
    </el-button-group>
    <span class="separator"></span>
    <el-button-group>
      <el-button type="primary" icon="el-icon-minus" size="mini" @click="heightMini"></el-button>
      <el-button size="mini" class="disable" style="color: #606266">画布高度</el-button>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="heightExtend"></el-button>
    </el-button-group>
    <span class="separator"></span>
    <el-button type="primary" size="mini" @click="layout">自动布局</el-button>
    <span class="separator"></span>
    <el-tooltip
      effect="light"
      content="DAG图显示不全时,可适当调整画布宽度和高度;支持鼠标右击复制节点"
      style="float: right; margin-right: 10px; line-height: 28px"
    >
      <i class="el-icon-info" style="color: #e6a23c; font-size: 12px"><span style="margin-left: 4px">提示</span></i>
    </el-tooltip>
  </div>
</template>

<script>
import eventBus from '@/utils/eventBus'
import '@/assets/icon/toolbar-icon/iconfont.css'

export default {
  name: 'Tasktoolbar',
  data() {
    return {
      page: {},
      graph: {},
      redoList: [],
      undoList: [],
      editor: null,
      command: null,
      selectedItem: null,
      notStartItem: true,
      taskEditor: null,
      taskCommand: null,
    }
  },
  watch: {
    selectedItem(val) {
      if (val && val.length > 1) {
        this.addGroup = true
      } else {
        if (val && val.length == 1 && (val[0]._cfg.id == '-1' || val[0]._cfg.id == '-2')) {
          this.notStartItem = false
        } else {
          this.notStartItem = true
        }
        this.addGroup = false
      }
    },
  },
  mounted() {
    this.bindEvent()
  },
  destroyed() {
    // 任务编辑的弹窗关闭时需取消事件监听，否则会重复监听事件
    eventBus.$off('afterAddTaskPage')
    eventBus.$off('taskadd')
    eventBus.$off('taskupdate')
    eventBus.$off('taskdelete')
    eventBus.$off('updateTaskItem')
    eventBus.$off('addTaskItem')
    eventBus.$off('tasknodeselectchange')
    eventBus.$off('deleteTaskItem')
  },
  methods: {
    bindEvent() {
      let self = this
      const { taskEditor, taskCommand } = this.$parent.$parent.$parent
      this.taskEditor = taskEditor
      this.taskCommand = taskCommand
      eventBus.$on('afterAddTaskPage', page => {
        self.page = page
        self.graph = self.page.graph
      })
      eventBus.$on('taskadd', data => {
        this.redoList = data.redoList
        this.undoList = data.undoList
      })
      eventBus.$on('taskupdate', data => {
        this.redoList = data.redoList
        this.undoList = data.undoList
      })
      eventBus.$on('taskdelete', data => {
        this.redoList = data.redoList
        this.undoList = data.undoList
      })
      eventBus.$on('updateTaskItem', item => {
        taskCommand.executeCommand('update', [item])
      })
      eventBus.$on('addTaskItem', item => {
        taskCommand.executeCommand('add', [item])
      })
      eventBus.$on('tasknodeselectchange', () => {
        this.selectedItem = this.graph.findAllByState('node', 'selected')
        this.selectedItem = this.selectedItem.concat(...this.graph.findAllByState('edge', 'selected'))
      })
      eventBus.$on('deleteTaskItem', () => {
        this.handleDelete()
      })
    },
    handleUndo() {
      if (this.undoList.length > 0) this.taskCommand.undo()
    },
    handleRedo() {
      if (this.redoList.length > 0) this.taskCommand.redo()
    },
    handleDelete(valid = true) {
      if (valid) {
        if (this.selectedItem.length > 0) {
          this.taskCommand.executeCommand('delete', this.selectedItem)
          this.selectedItem = null
        }
      }
    },
    handleZoomIn() {
      const currentZoom = this.graph.getZoom()
      this.graph.zoomTo(currentZoom + 0.1)
    },
    handleZoomOut() {
      const currentZoom = this.graph.getZoom()
      this.graph.zoomTo(currentZoom - 0.1)
    },
    addNode() {
      // Add a new node
      let model = {
        x: 150,
        y: 150,
        name: 'task',
        label: 'task',
        size: [120, 34],
        type: 'node',
        shape: 'customNode',
        color: '#1890ff',
        inPoints: [[0, 0.5]],
        outPoints: [[1, 0.5]],
        task: {
          // showOrder: this.node.tasks.length + 1,
          name: 'task',
          type: '',
          active: true,
          variableMap: {},
          outputVariableMap: {},
          params: [],
          outputParams: [],
        },
      }
      this.taskCommand.executeCommand('add', [model])
    },
    layout() {
      this.graph.layout()
    },
    widthExtend() {
      this.graph.changeSize(this.graph.cfg.width + 200, this.graph.cfg.height)
      const container = document.getElementById('task-graph-container')
      container.style.width = this.graph.cfg.width + 'px'
      this.taskEditor.emit('afterAddTaskPage', { graph: this.graph, taskComand: this.taskCommand })
    },
    widthMini() {
      this.graph.changeSize(this.graph.cfg.width - 200, this.graph.cfg.height)
      const container = document.getElementById('task-graph-container')
      container.style.width = this.graph.cfg.width + 'px'
      this.taskEditor.emit('afterAddTaskPage', { graph: this.graph, taskComand: this.taskCommand })
    },
    heightMini() {
      this.graph.changeSize(this.graph.cfg.width, this.graph.cfg.height - 200)
      const container = document.getElementById('task-graph-container')
      container.style.height = this.graph.cfg.height + 'px'
      this.taskEditor.emit('afterAddTaskPage', { graph: this.graph, taskComand: this.taskCommand })
    },
    heightExtend() {
      this.graph.changeSize(this.graph.cfg.width, this.graph.cfg.height + 200)
      const container = document.getElementById('task-graph-container')
      container.style.height = this.graph.cfg.height + 'px'
      this.taskEditor.emit('afterAddTaskPage', { graph: this.graph, taskComand: this.taskCommand })
    },
  },
}
</script>

<style scoped>
.toolbar {
  box-sizing: border-box;
  padding: 8px 0px;
  width: 96%;
  border: 1px solid #e9e9e9;
  height: 42px;
  z-index: 3;
  box-shadow: 0px 8px 12px 0px rgba(0, 52, 107, 0.04);
  position: absolute;
  text-align: left;
}
.toolbar .command:nth-of-type(1) {
  margin-left: 24px;
}
.toolbar .command {
  box-sizing: border-box;
  width: 27px;
  height: 27px;
  margin: 0px 6px;
  border-radius: 2px;
  padding-left: 4px;
  display: inline-block;
  border: 1px solid rgba(2, 2, 2, 0);
}
.toolbar .command:hover {
  cursor: pointer;
  border: 1px solid #e9e9e9;
}
.toolbar .disable {
  color: rgba(0, 0, 0, 0.25);
  pointer-events: none;
}
.toolbar .separator {
  margin: 4px;
  border-left: 1px solid #e9e9e9;
}
</style>
