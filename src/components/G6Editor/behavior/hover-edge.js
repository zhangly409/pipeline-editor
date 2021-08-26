
import { each } from '@antv/util';
import eventBus from "@/utils/eventBus";
export default {
    getEvents() {
        return {
            'edge:mouseover': 'onMouseover',
            'edge:mouseleave': 'onMouseleave',
            "edge:click": "onClick",
        };
    },
    onMouseover(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        if (item.hasState('selected')) {
            return
        } else {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'hover', true);
            }
        }
        graph.paint();
    },
    onMouseleave(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        const group = item.getContainer()
        group.find(g => {
            if (g.attrs.isInPoint || g.attrs.isOutPoint) {
                g.attr("fill", "#fff")
            }
        });
        if (self.shouldUpdate.call(self, e)) {
            if (!item.hasState('selected'))
                graph.setItemState(item, 'hover', false);
        }
        graph.paint();
    },
    onClick(e) {
        const self = this;
        const item = e.item;
        const graph = self.graph;
        const autoPaint = graph.get('autoPaint');
        graph.setAutoPaint(false);
        const selectedNodes = graph.findAllByState('node', 'selected');
        each(selectedNodes, node => {
            graph.setItemState(node, 'selected', false);
        });
        if (!self.keydown || !self.multiple) {
            const selected = graph.findAllByState('edge', 'selected');
            each(selected, edge => {
                if (edge !== item) {
                    graph.setItemState(edge, 'selected', false);
                    graph.setItemState(edge, 'hover', false);
                }
            });
        }
        if (item.hasState('selected')) {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'selected', false);
                graph.setItemState(item, 'hover', false);
            }
            if (graph.cfg.container.className == 'graph-container') {
              eventBus.$emit('nodeselectchange', { target: item, select: false });
            } else if (graph.cfg.container.className == 'task-graph-container') {
              eventBus.$emit('tasknodeselectchange', { target: item, select: false });
            }
        } else {
            if (self.shouldUpdate.call(self, e)) {
                graph.setItemState(item, 'selected', true);
                graph.setItemState(item, 'hover', false);
            }
            if (graph.cfg.container.className == 'graph-container') {
              eventBus.$emit('nodeselectchange', { target: item, select: true });
            } else if (graph.cfg.container.className == 'task-graph-container') {
              eventBus.$emit('tasknodeselectchange', { target: item, select: true });
            }
        }
        graph.setAutoPaint(autoPaint);
        graph.paint();
    },

};
