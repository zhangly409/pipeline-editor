<template>
  <div class="detailPanel">
    <el-row v-if="status=='node-selected' && task">
      <el-col :span="24">
        <el-container style="margin-top:20px;border-left:1px dashed #C4C6Cf">
          <el-main
            style="background-color: #F7F8FA;border: 1px solid #DCDEE3;margin-top: 6px;"
          >
          <el-form
                ref="taskform"
                label-width="20%"
                :model="task"
                size="mini"
              >
                <el-form-item
                  label="任务名称"
                  prop="name"
                  style="margin-top:20px;"
                >
                  <el-input
                    v-model="task.name"
                    style="float: left; width: 90%;"
                    @input.native="handleChangeName($event)"
                  ></el-input>
                </el-form-item>
               
                <el-form-item
                  label="任务局部变量"
                  style="margin-top:20px;margin-right: 2%"
                  prop="params"
                >
                  <div
                    class="task-input-suffix"
                    v-for="(param, index) in task.params"
                    v-bind:key="index"
                  >
                    <el-input
                      v-model="param.key"
                      @input="change($event)"
                      placeholder="请输入变量名"
                    ></el-input
                    >&nbsp;=&nbsp;
                    <el-input
                      v-model="param.value"
                      @input="change($event)"
                      placeholder="请输入变量值"
                    ></el-input>
                    <span v-on:click="deleteParam(index, 'task', 'input')"
                      >删除</span
                    >
                  </div>
                  <div class="task-input-add">
                    <span v-on:click="addParam('task', 'input')">
                      <i class="el-icon-plus"></i>添加变量
                    </span>
                    <el-tooltip
                      class="item"
                      content="支持通过 ${XX} 格式注入变量。"
                      placement="right"
                      effect="dark"
                    >
                      <span>
                        <i class="el-icon-question"></i>
                      </span>
                    </el-tooltip>
                  </div>
                </el-form-item>
                <el-form-item
                  label="输出设置"
                  style="margin-top:20px;margin-right: 2%"
                  prop="outputParams"
                >
                  <div
                    class="task-input-suffix"
                    v-for="(param, index) in task.outputParams"
                    v-bind:key="index"
                  >
                    <el-input
                      v-model="param.key"
                      placeholder="请输入变量名"
                      @input="change($event)"
                    ></el-input
                    >&nbsp;=&nbsp;
                    <el-input
                      v-model="param.value"
                      placeholder="请输入变量值"
                      @input="change($event)"
                    ></el-input>
                    <span v-on:click="deleteParam(index, 'task', 'output')"
                      >删除</span
                    >
                  </div>
                  <div class="task-input-add">
                    <span v-on:click="addParam('task', 'output')">
                      <i class="el-icon-plus"></i>添加变量
                    </span>
                    <el-tooltip
                      class="item"
                      content="任务执行成功后，加入本阶段局部变量，本阶段后续任务均可使用。支持通过 ${XX} 格式注入变量。"
                      placement="right"
                      effect="dark"
                    >
                      <span>
                        <i class="el-icon-question"></i>
                      </span>
                    </el-tooltip>
                  </div>
                </el-form-item>
              </el-form>
          </el-main>
        </el-container>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import eventBus from "@/utils/eventBus";
import { textOverflow } from "@/utils/util";

export default {
  data() {
    return {
      status: "canvas-selected",
      page: {},
      graph: {},
      item: {},
      // node: {},
      stages: [],
      stage: {
        params: [],
        outputParams: []
      },
      task: {},
      tasks: [],
      pipelineFormRule: {
        name: [{ required: true, message: "请输入流水线名称", trigger: "blur" }]
      },
      VALID_VARIABLE_PATTERN: /^[A-Za-z_][A-Za-z0-9_]*$/,
      taskIndex: 0,
      status: "canvas-selected"
    };
  },
  props: {
    node: {
      type: Object,
      default: () => {}
    }
  },
  components: {},
  computed: {},
  created() {
    this.bindEvent();
    this.init();
  },
  methods: {
    init() {
    },
    bindEvent() {
      let self = this
      eventBus.$on("afterAddTaskPage", page => {
        self.page = page;
        self.graph = self.page.graph;
        eventBus.$on("tasknodeselectchange", item => {
          if (item.select === true && item.target.getType() === "node" && item.target._cfg.id !== '-1' && item.target._cfg.id !== '-2' ) {
            self.task = item.target._cfg.model.task || {}
            self.item = item.target
            self.status = "node-selected"
          } else {
            self.task = {}
            self.item = null
            self.status = "canvas-selected"
          }
        })
      })
    },
    handleChangeName(e) {
      let labelFormat = textOverflow(e.target.value, 15);
      const model = {
        label: labelFormat,
        name: e.target.value
      };
      this.graph.update(this.item, model);
    },
    addParam(level, type) {
      if (level == "stage") {
        if (type == "input") {
          this.node.params.push({ key: "", value: "" });
          const model = {
            params: this.node.params
          };
          this.graph.update(this.item, model);
        } else if (type == "output") {
          this.node.outputParams.push({ key: "", value: "" });
          const model = {
            outputParams: this.node.outputParams
          };
          this.graph.update(this.item, model);
        }
        this.$forceUpdate();
      } else if (level == "task") {
        if (type == "input") {
          this.task.params.push({ key: "", value: "" });
        } else if (type == "output") {
          this.task.outputParams.push({ key: "", value: "" });
        }
        this.$forceUpdate();
      }
    },
    deleteParam(index, level, type) {
      if (level == "stage") {
        if (type == "input") {
          this.node.params.splice(index, 1);
          const model = {
            params: this.node.params
          };
          this.graph.update(this.item, model);
        } else if (type == "output") {
          this.node.outputParams.splice(index, 1);
          const model = {
            outputParams: this.node.outputParams
          };
          this.graph.update(this.item, model);
        }
        this.$forceUpdate();
      } else if (level == "task") {
        if (type == "input") {
          this.task.params.splice(index, 1);
        } else if (type == "output") {
          this.task.outputParams.splice(index, 1);
        }
        this.$forceUpdate();
      }
    },
    change(e) {
      this.$forceUpdate();
    },
    deepCopy(obj) {
      var result = Array.isArray(obj) ? [] : {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object") {
            result[key] = this.deepCopy(obj[key]); //递归复制
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    },
  }
};
</script>

<style scoped>
.task-page{
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
  color: #F56C6C;
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
.gray_table >>> th:not(.unrequired-th):not(:last-child) .cell::before {
  content: "*";
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
.el-cascader-panel >>> .el-cascader-menu{
  width: 50%;
}
.task-graph-container >>>.g6-tooltip {
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
  z-index: 0!important
}
</style>
