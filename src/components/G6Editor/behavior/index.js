import G6 from "@antv/g6";
import hoverNode from './hover-node'
import addLine from './add-edge'
import selectNode from './select-node'
import hoverEdge from "./hover-edge";
import keyboard from './keyboard'

const behavors = {
    'hover-node': hoverNode,
    'add-edge': addLine,
    'select-node': selectNode,
    'hover-edge': hoverEdge,
    'keyboard':keyboard,
}

export function initBehavors() {
    for (let key in behavors) {
        G6.registerBehavior(key, behavors[key])
    }
}


