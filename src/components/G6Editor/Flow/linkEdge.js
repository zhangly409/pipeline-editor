import G6 from "@antv/g6";

const linkEdge = {
  init() {
    G6.registerEdge('link-edge', {
      getPath(points) {
        const startPoint = points[0];
        const endPoint = points[1];
        return [
          [ 'M', startPoint.x, startPoint.y ],
          [ 'L', endPoint.x, endPoint.y ]];
      },
      getShapeStyle(cfg) {
        const startPoint = cfg.startPoint;
        const endPoint = cfg.endPoint;
        const controlPoints = this.getControlPoints(cfg);
        let points = [ startPoint ]; // 添加起始点
        // 添加控制点
        if (controlPoints) {
          points = points.concat(controlPoints);
        }
        // 添加结束点
        points.push(endPoint);
        const path = this.getPath(points);
        const style = G6.Util.mix({}, G6.Global.defaultEdge.style, {
          path,
          stroke: '#1890FF',
          strokeOpacity: 0.9,
          lineDash: [5, 5]
        }, cfg.style);
        return style;
      }
    }, 'polyline');
  }
}

export default linkEdge
