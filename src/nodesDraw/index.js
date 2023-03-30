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