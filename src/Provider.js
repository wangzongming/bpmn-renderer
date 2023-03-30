import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
/**
 * 参见主题设计
 * https://dribbble.com/shots/15511407-BPMN-Editor-UI/attachments/7288822?mode=media
 * 参见案例
 * https://github.com/bpmn-io/bpmn-js-sketchy/blob/master/lib/SketchyRenderer.js
*/
import { is } from 'bpmn-js/lib/util/ModelUtil';
// import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getCirclePath, getRoundRectPath, getDiamondPath, getRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';

import { merge } from 'min-dash';
import nodesDraw from './nodesDraw'
import defaultStyle from './defaultStyle'
const HIGH_PRIORITY = 1500, TASK_BORDER_RADIUS = 10;
/**
 * 自定义元素样式、小图标样式插件 
 */
function CustomRendererFn({ nodesInfo = {}, style = {} }) {
    class CustomRenderer extends BaseRenderer {
        constructor(eventBus, bpmnRenderer, styles, pathMap, canvas, config, textRenderer) {
            super(eventBus, HIGH_PRIORITY);

            this.bpmnRenderer = bpmnRenderer;
            this.styles = styles;
            this.pathMap = pathMap;
            this.canvas = canvas;
            this.config = config;
            this.textRenderer = textRenderer;

            /**
             * 元素样式
             */
            this.diyStyle = merge({}, { ...defaultStyle }, { ...style })

            this.thisContext = {
                bpmnRenderer: this.bpmnRenderer,
                styles: this.styles,
                pathMap: this.pathMap,
                canvas: this.canvas,
                config: this.config,
                textRenderer: this.textRenderer,
            }
        }

        /**
         * @eleName 元素类型 base | node | arrows | icon
         * @status 状态  over ing will
        */
        getEleStyle(eleName, status = "will") {
            if (eleName === "base") return this.diyStyle[eleName];
            return this.diyStyle[status][eleName]
        }

        canRender(element) {
            // return isAny(element, ['bpmn:UserTask']); // test use ...
            return is(element, 'bpmn:BaseElement');
        }

        // 绘制外框形状
        drawShape(parentNode, element) {
            // 图形信息, label 的id 是拼接上 label 的，这 label 应该使用 节点信息
            const nodeInfo = nodesInfo[`${element.id}`.replace("_label", "")] || {};
            // 节点状态
            let nodeStatus = nodeInfo["status"] || "will";
            // 连接线节点状态取决于 target
            if (is(element, 'bpmn:SequenceFlow')) {
                const target = element.target;
                if (target) {
                    const targetNodeInfo = nodesInfo[`${target.id}`.replace("_label", "")] || {};
                    nodeStatus = targetNodeInfo["status"] || "will";
                }
            }
            const type = element.type;
            const h = nodesDraw({
                nodeStatus,
                getEleStyle: this.getEleStyle.bind(this),
                thisContext: this.thisContext
            })[type];
            if (h) {
                return h(parentNode, element);
            } else {
                return this.bpmnRenderer.drawShape(parentNode, element);
            }
        }

        getShapePath(element) {
            // return this.bpmnRenderer.getShapePath(element);
            if (is(element, 'bpmn:Event')) {
                return getCirclePath(element);
            }

            if (is(element, 'bpmn:Activity')) {
                return getRoundRectPath(element, TASK_BORDER_RADIUS);
            }

            if (is(element, 'bpmn:Gateway')) {
                return getDiamondPath(element);
            }

            return getRectPath(element);
        }

        drawConnection(parentGfx, element) {
            return this.drawShape(parentGfx, element);
        };
    }

    CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'styles', 'pathMap', 'canvas', 'config', 'textRenderer'];
    return CustomRenderer;
}

export default CustomRendererFn
