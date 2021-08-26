<template>
  <div>
    <ViewToolbar :isTaskViewShow="isTaskViewShow" />
    <div style="height: 42px;"></div>
    <div class="task-view-container">
      <div class="view-page" id="view">
        <div id="view-page" class="view-container"></div>
      </div>
    </div>
  </div>
</template>

<script>
import G6 from "@antv/g6";
import eventBus from "@/utils/eventBus";
import { textOverflow } from "@/utils/util";
import customNode from "../Flow/customNode";
import { uniqueId } from "@/utils";
import Flow from "../Flow";
import ViewToolbar from "../ViewToolbar";

export default {
  data() {
    return {
      graph: null
    };
  },
  props: {
    isTaskViewShow: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: document.documentElement.clientWidth
    }
  },
  components: {
    ViewToolbar
  },
  mounted() {
    this.bindEvent();
  },
  methods: {
    bindEvent() {
      let self = this;
      eventBus.$on("afterAddViewPage", page => {
        this.graph = page.graph;
      });
    },
    init(graphData) {
      let grid = new G6.Grid();
      if (this.graph) {
        this.graph.destroy()
      }
      const container = document.getElementById('view-page');
      this.graph = new G6.Graph({
        container: "view-page",
        width: container.style.width ? container.style.width : this.width,
        height: container.style.height ? container.style.height: 800,
        plugins: [grid],
        renderer: "svg",
        modes: {
          // 支持的 behavior
          default: [
            'drag-node',
            'activate-relations',
            {
              type: "tooltip",
              formatText: function formatText(model) {
                return model.name;
              },
              shouldBegin: e => {
                if (
                  e.item.getModel().id !== "-1" &&
                  e.item.getModel().id !== "-2" &&
                  textOverflow(e.item.getModel().name, 15).indexOf("...") !== -1
                ) {
                  return true;
                }
              },
              shouldUpdate: function shouldUpdate(e) {
                return true;
              }
            }
          ]
        },
        layout: {
          type: "dagre",
          rankdir: "LR",
          nodesep: 20,
          ranksep: 40,
          controlPoints: true
        },
        defaultEdge: {
          type: "polyline",
          style: {
            endArrow: true,
            lineWidth: 1,
            stroke: "#303133",
            lineAppendWidth: 10
          },
        },
        defaultNode: {
          style: {
            lineWidth: 1,
            stroke: "#409EFF",
            radius: 5,
            offset: 30
          },
          labelCfg: {
            style: {
              fill: "303133"
            }
          },
          anchorPoints: [
            [0, 0.5],
            [1, 0.5]
          ]
        },
        edgeStateStyles: {
          selected: {
            stroke: "#409EFF"
          },
          hover: {
            stroke: "#409EFF",
            lineWidth: 1.5,
            opacity: 0.6
          }
        }
      });
      this.initData(graphData)
    },
    initData(graphData) {
      let taskNodesState = [];
      let stagesObject = {};
      let postNodesMap = {};
      let taskEdgesState = [];
      let that = this;
      taskNodesState.push(
        {
          id: "node-1",
          name: "开始",
          label: "开始",
          size: [120, 34],
          type: "circle",
          style: {
            r: 23,
            fill: "#fff"
          },
          anchorPoints: [
            [0, 0.5, {type: 'circle', style: {stroke: 'red', fill: 'white'}}],
            [1, 0.5, {type: 'circle', style: {stroke: 'red', fill: 'white'}}]
          ]
        },
        {
          id: "node-2",
          name: "结束",
          label: "结束",
          type: "circle",
          style: {
            r: 23,
            fill: "#fff"
          },
          anchorPoints: [
            [0, 0.5],
            [1, 0.5]
          ]
        }
      );
      let nodes = graphData.nodes.filter(node => {
        return node.id != "-1" && node.id != "-2";
      });
      nodes.map(stage => {
        stage.labelFormat = textOverflow(stage.name, 15);
        taskNodesState.push(
          {
            id: "node" + stage.id.toString() + "-1",
            name: stage.name,
            label: stage.labelFormat,
            size: [120, 34],
            type: "diamond",
            style: {
              stroke: "#409EFF",
              fill: "#fff"
            },
            outputParams: stage.outputParams,
            params: stage.params,
            tasks: stage.tasks,
            postTaskIdsMap: stage.postTaskIdsMap,
          },
          {
            id: "node" + stage.id.toString() + "-2",
            name: "end",
            size: [10, 10],
            type: "node",
            shape: "circle",
            style: {
              stroke: "#409EFF",
              fill: "#409EFF"
            },
            outputParams: stage.outputParams,
            params: stage.params,
            tasks: stage.tasks,
            postTaskIdsMap: stage.postTaskIdsMap,
          }
        );
        stage.tasks.map(task => {
          task.labelFormat = textOverflow(task.name, 15);
          taskNodesState.push({
            name: task.name,
            label: task.labelFormat,
            id: "node" + stage.id + "-" + task.id,
            size: [120, 34],
            type: "rect",
            style: {
              stroke: "#409EFF",
              fill: "#fff",
              radius: 2
            },
          });
        });
        stagesObject["node" + stage.id] = stage;
        postNodesMap[stage.id.toString()] = [];
      });
      postNodesMap["-1"] = [];
      postNodesMap["-2"] = [];
      graphData.edges.map(edge => {
        Object.keys(postNodesMap).map(key => {
          if (key == edge.source) {
            postNodesMap[key.toString()].push(edge.target);
          }
        });
      });
      Object.keys(postNodesMap).map(key => {
        postNodesMap[key].map(node => {
          if (key.toString() == "-1") {
            // 阶段视图上开始节点出发的连线，在任务视图上的转换
            taskEdgesState.push({
              source: "node" + "-1",
              target: "node" + node + "-1",
            });
          } else {
            let postTaskIdsMap = '';
            postTaskIdsMap = stagesObject["node" + key].postTaskIdsMap;
            // 设置任务节点的连线
            Object.keys(JSON.parse(postTaskIdsMap)).map(taskKey => {
              if (taskKey.toString() == "-1") {
                // 将任务节点中的开始节点替换成阶段开始的节点
                JSON.parse(postTaskIdsMap)[taskKey].map(task => {
                  taskEdgesState.push({
                    source: "node" + key + "-1",
                    target: "node" + key + "-" + task,
                  });
                });
              } else {
                JSON.parse(postTaskIdsMap)[taskKey].map(task => {
                  if (task.toString() !== "-2") {
                    taskEdgesState.push({
                      source: "node" + key + "-" + taskKey,
                      target: "node" + key + "-" + task,
                    });
                  } else {
                    // 将任务节点中的结束节点替换成阶段结束的节点
                    taskEdgesState.push({
                      source: "node" + key + "-" + taskKey,
                      target: "node" + key + "-2",
                    });
                  }
                });
              }
            });
            if (node.toString() !== "-2") {
              // 设置前一个阶段结束节点和后一个阶段开始节点之间的连线
              taskEdgesState.push({
                source: "node" + key + "-2",
                target: "node" + node + "-1",
              });
            } else {
              // 设置阶段结束节点和结束节点之间的连线
              taskEdgesState.push({
                source: "node" + key + "-2",
                target: "node" + "-2",
              });
            }
          }
        });
      });
      let data = {
        nodes: taskNodesState,
        edges: taskEdgesState
      };
      const { editor } = this.$parent;
      editor.emit("afterAddViewPage", { graph: this.graph });
      if (data) {
        this.graph.data(data);
        this.graph.render();
      }
    }
  }
};
</script>
<style scoped>
.view-container >>> .g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
.view-container {
  height: 100%;
  width: 100%;
  position: relative;
  font-size: 12px;
  color: #303133;
}
.view-page {
  overflow: auto;
  height: 800px;
  width: 100%;
}
</style>
