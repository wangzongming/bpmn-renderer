import {
    append as svgAppend,
    create as svgCreate,
} from 'tiny-svg';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import { drawRect, renderEmbeddedLabel, renderExternalLabel, renderTextAnnotation, renderAssociation, drawCircle, drawerIcon, drawPath } from "./utils"

function nodesDraw({ nodeStatus, getEleStyle, thisContext }) {
    const baseStyle = getEleStyle("base");
    const styleConfig = getEleStyle("node", nodeStatus);
    const iconConfig = getEleStyle("icon", nodeStatus);
    const arrowsConfig = getEleStyle("arrows", nodeStatus);

    const deawFnProps = {
        baseStyle, styleConfig, iconConfig, arrowsConfig, thisContext, nodeStatus
    }

    const renders = {
        'bpmn:UserTask': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = drawRect({ parentGfx, element, ...deawFnProps });
            /** 文字绘制 **/
            renderEmbeddedLabel({ parentGfx, element, align: 'center-middle', thisContext, styleConfig });
            return node;
        },
        'bpmn:ScriptTask': function (parentGfx, element) {
            return renders['bpmn:UserTask'](parentGfx, element)
        },
        'bpmn:ServiceTask': function (parentGfx, element) {
            return renders['bpmn:UserTask'](parentGfx, element)
        },

        /**
         * 文字备注
        */
        'bpmn:TextAnnotation': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = renderTextAnnotation({ parentGfx, element, ...deawFnProps });
            /** 文字绘制 **/
            renderEmbeddedLabel({ parentGfx, element, align: 'center-middle', ...deawFnProps });

            return node;
        },
        /**
         * 文字备注的连接虚线
        */
        'bpmn:Association': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = renderAssociation({ parentGfx, element, ...deawFnProps });
            return node;
        },

        /**
        * 开始节点
        */
        'bpmn:StartEvent': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = drawCircle({ parentGfx, element, ...deawFnProps });
            return node;
        },

        /**
         * 结束节点
         */
        'bpmn:EndEvent': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = drawCircle({ parentGfx, element, ...deawFnProps });
            return node;
        },

        /**
         * 节点外部的文字，比如开始节点
        */
        'label': function (parentGfx, element) {
            return renderExternalLabel({ parentGfx, element, ...deawFnProps });
        },
        /**
         * 边界事件
        */
        'bpmn:IntermediateThrowEvent': function (parentGfx, element) {
            /** 第一个外框绘制 **/
            const node = drawCircle({ parentGfx, element, ...deawFnProps });
            /** 第二个外框绘制, 不能要阴影 **/
            drawCircle({
                startX: 3,
                startY: 3,
                parentGfx, element: {
                    ...element,
                    width: element.width - 6,
                    height: element.height - 6,
                }, thisContext,
                styleConfig: {
                    ...styleConfig,
                    boxShadowSize: 0,
                }
            });
            return node;
        },
        /**
         * 网关
        */
        'bpmn:ExclusiveGateway': function (parentGfx, element) {
            /** 外框绘制 **/
            const node = drawRect({ parentGfx, element, ...deawFnProps, drawType: "diamond", iconCentered: true });
            return node;
        },
        // 独占网关
        'bpmn:ParallelGateway': function (parentGfx, element) {
            const node = renders["bpmn:ExclusiveGateway"](parentGfx, element);
            /** 特制小图标绘制 **/
            const { color } = iconConfig;
            const { width, height } = baseStyle;
            let d = "";
            let svgIcon;
            if (is(element, "bpmn:ParallelGateway")) {
                d = "m 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z"
            }
            if (is(element, "bpmn:InclusiveGateway")) {
                svgIcon = svgCreate("circle", {
                    cx: width / 2, cy: height / 2, r: 12,
                    style: `stroke: ${color}; stroke-width: 2.5px; fill: none;`
                });
            }
            if (is(element, "bpmn:ComplexGateway")) {
                d = "m 23,13 0,7.116788321167883 -5.018248175182482,-5.018248175182482 -3.102189781021898,3.102189781021898 5.018248175182482,5.018248175182482 -7.116788321167883,0 0,4.37956204379562 7.116788321167883,0  -5.018248175182482,5.018248175182482 l 3.102189781021898,3.102189781021898 5.018248175182482,-5.018248175182482 0,7.116788321167883 4.37956204379562,0 0,-7.116788321167883 5.018248175182482,5.018248175182482 3.102189781021898,-3.102189781021898 -5.018248175182482,-5.018248175182482 7.116788321167883,0 0,-4.37956204379562 -7.116788321167883,0 5.018248175182482,-5.018248175182482 -3.102189781021898,-3.102189781021898 -5.018248175182482,5.018248175182482 0,-7.116788321167883 -4.37956204379562,0 z"
            }
            if (is(element, "bpmn:EventBasedGateway")) {
                const circle1 = svgCreate("circle", {
                    cx: width / 2, cy: height / 2, r: 15,
                    style: `stroke: ${color}; stroke-width: 1px; fill: none;`
                });
                const circle2 = svgCreate("circle", {
                    cx: width / 2, cy: height / 2, r: 12,
                    style: `stroke: ${color}; stroke-width: 1px; fill: none;`
                });
                svgAppend(parentGfx, circle1);
                svgAppend(parentGfx, circle2);

                svgIcon = svgCreate("path", {
                    d: "m 18,22 7.363636363636364,-4.909090909090909 7.363636363636364,4.909090909090909 -2.4545454545454546,9.818181818181818 -9.818181818181818,0 z",
                    style: `fill: ${color}; stroke-width: 2px; stroke: ${color};`
                });
            }
            if (d) {
                svgIcon = svgCreate("path", {
                    d: d,
                    style: `fill: ${color}; stroke-width: 1px; stroke: ${color};`
                });
            }
            svgIcon && svgAppend(parentGfx, svgIcon);
            return node;
        },
        // 包容网关
        'bpmn:InclusiveGateway': function (parentGfx, element) {
            const node = renders["bpmn:ParallelGateway"](parentGfx, element);
            return node;
        },
        // 复杂网关
        'bpmn:ComplexGateway': function (parentGfx, element) {
            const node = renders["bpmn:ParallelGateway"](parentGfx, element);
            return node;
        },
        // 事件网关
        'bpmn:EventBasedGateway': function (parentGfx, element) {
            const node = renders["bpmn:ParallelGateway"](parentGfx, element);
            return node;
        },
        /**
         * 节点连接线
        */
        'bpmn:SequenceFlow': function (parentGfx, element) {
            const node = drawPath({ parentGfx, element, ...deawFnProps });
            return node;
        },
    }

    return renders;
}
export default nodesDraw;