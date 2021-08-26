<template>
  <div class="toolbar">
    <el-button-group>
      <el-button type="primary" icon="el-icon-minus" size="mini" @click="widthMini"></el-button>
      <el-button size="mini" class="disable" style="color:#606266 ">调整画布宽度</el-button>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="widthExtend"></el-button>
    </el-button-group>
    <span class="separator"></span>
    <el-button-group>
      <el-button type="primary" icon="el-icon-minus" size="mini" @click="heightMini"></el-button>
      <el-button size="mini" class="disable" style="color:#606266 ">调整画布高度</el-button>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="heightExtend"></el-button>
    </el-button-group>
    <span class="separator"></span>
    <i class="el-icon-info" style="color: #58C7C7"></i><span style="font-size: 12px;margin-left: 5px;color: #303133;">{{'DAG图显示不全时,可适当调整画布宽度和高度'}}</span>
    <i @click="unfold" class="el-icon-rank" style="position: absolute; right: 10px;cursor: pointer;color: #58C7C7"><span style="font-size: 12px;margin-left: 5px;color: #303133;">{{isTaskViewShow ? '切换阶段视图':'切换任务视图'}}</span></i>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import { textOverflow } from "@/utils/util";

export default {
  data() {
    return {
      page: {},
      graph: {},
      editor: null,
      command: null,
      isTaskViewShow: false
    };
  },
  created() {
    this.init();
    this.bindEvent();
  },
  methods: {
    init() {
      const { editor, command } = this.$parent;
      this.editor = editor;
      this.command = command;
    },
    bindEvent() {
      let self = this;
      eventBus.$on("afterAddViewPage", page => {
        self.page = page;
        self.graph = self.page.graph;
      });
      eventBus.$on('taskViewSwitch',value => {
        self.isTaskViewShow = value.isTaskViewShow
      })
    },
    unfold () {
      this.isTaskViewShow = !this.isTaskViewShow
      eventBus.$emit('taskViewSwitch',{ isTaskViewShow: this.isTaskViewShow })
    },
    widthExtend () {
      this.graph.changeSize(this.graph.cfg.width + 200,this.graph.cfg.height)
      const container = document.getElementById('view-page');
      container.style.width = this.graph.cfg.width + 'px'
      const { editor } = this.$parent.$parent;
      editor.emit("afterAddViewPage", { graph: this.graph });
    },
    widthMini () {
      this.graph.changeSize(this.graph.cfg.width - 200,this.graph.cfg.height)
      const container = document.getElementById('view-page');
      container.style.width = this.graph.cfg.width + 'px'
      const { editor } = this.$parent.$parent;
      editor.emit("afterAddViewPage", { graph: this.graph });
    },
    heightMini () {
      this.graph.changeSize(this.graph.cfg.width, this.graph.cfg.height - 200)
      const container = document.getElementById('view-page');
      container.style.height = this.graph.cfg.height + 'px'
      const { editor } = this.$parent.$parent;
      editor.emit("afterAddViewPage", { graph: this.graph });
    },
    heightExtend () {
      this.graph.changeSize(this.graph.cfg.width, this.graph.cfg.height + 200)
      const container = document.getElementById('view-page');
      container.style.height = this.graph.cfg.height + 'px'
      const { editor } = this.$parent.$parent;
      editor.emit("afterAddViewPage", { graph: this.graph });
    }
  }
};
</script>

<style scoped>
.toolbar {
  box-sizing: border-box;
  padding: 8px 0px;
  width: 100%;
  border: 1px solid #e9e9e9;
  height: 42px;
  z-index: 3;
  box-shadow: 0px 8px 12px 0px rgba(0, 52, 107, 0.04);
  position: absolute;
  text-align:left
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
