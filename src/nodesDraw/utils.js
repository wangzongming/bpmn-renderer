
import {
    getSemantic,
    getCirclePath,
    getDiamondPath,
    getRoundRectPath,
    getStrokeColor,
    getRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import {
    append as svgAppend,
    prepend as svgPrepend,
    attr as svgAttr,
    create as svgCreate,
    selectAll as svgSelectAll,
    select as svgSelect,
    classes as svgClasses,
    innerSVG
} from 'tiny-svg';
import { assign } from 'min-dash';
import { isAny, is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil';

/**
 * 绘制一个带边框的节点外框
*/
export function drawRect({ parentGfx, element, nodeStatus, baseStyle = {}, styleConfig, iconConfig = {}, drawType = "rect", startX = 0, startY = 0, iconCentered }) {
    const { id, type } = element;
    const privateBaseStyle = baseStyle[type] || {};
    const { width = element.width, height = element.height } = { ...baseStyle, ...privateBaseStyle };

    // 节点可以特定样式
    const privateStyle = styleConfig[type];
    const { borderColor, borderWidth, backgroundColor, borderRadius, boxShadowSize } = {
        ...styleConfig,
        ...privateStyle
    };

    /** 元素路径 **/
    let pathData;
    switch (drawType) {
        case "circle": // 圆形 
            pathData = getCirclePath(assign({}, element, { x: startX, y: startY }));
            break;
        case "diamond": // 菱形
            pathData = getDiamondPath(assign({}, element, { x: startX, y: startY }));
            break;
        default:
            // 默认绘制正方形, 这里的宽高度要进行有些兼容，不然现有数据的宽高和设置宽高不一致会导致渲染错位
            let rectStyle = { x: startX, y: startY, width, height };
            if (width !== element.width) {
                rectStyle = { x: startX, y: startY };
            }
            pathData = getRoundRectPath(assign({}, element, rectStyle), borderRadius);
            break;
    }

    /** 元素绘制、外框边框和背景绘制 **/
    const newSvg = svgCreate("path", {
        d: pathData,
        stroke: borderColor,
        strokeWidth: borderWidth,
        fill: backgroundColor,
        fillStyle: 'solid'
    });
    svgAppend(parentGfx, newSvg);

    /** 边框阴影绘制 **/
    const svgBorder = svgCreate("path", { d: pathData, fill: borderColor });
    svgAttr(svgBorder, { fill: backgroundColor, width: width + borderWidth * 2, height: height + borderWidth * 2, });
    const filter = svgCreate('filter', { id: `${id}_shadow` });
    const feOffset = svgCreate('feOffset', { result: "offOut", in: "SourceGraphic", dx: "0", dy: "0" });
    const feColorMatrix = svgCreate('feColorMatrix', {
        result: "matrixOut", in: "offOut", type: 'matrix', values: `
        0.1 0.5 0 0 0 
        0 0.2 0 0 0 0 
        0 0.2 0 0 0 0 
        0 1 0
    ` });
    // const feColorMatrix = svgCreate('feColorMatrix', { result: "matrixOut", in: "offOut", type: 'matrix', values: "0.08 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" });
    const feGaussianBlur = svgCreate('feGaussianBlur', { result: "blurOut", in: "matrixOut", stdDeviation: boxShadowSize });
    const feBlend = svgCreate('feBlend', { in: "SourceGraphic", in2: "blurOut", mode: "normal" });
    svgAppend(filter, feOffset);
    svgAppend(filter, feColorMatrix);
    svgAppend(filter, feGaussianBlur);
    svgAppend(filter, feBlend);
    svgAppend(parentGfx, svgBorder);
    svgPrepend(parentGfx, filter);
    svgAttr(svgBorder, { filter: `url(#${id}_shadow)` });

    /** 闪动动画 **/
    if (nodeStatus === "ing") {
        const aniSvg = svgCreate("animate");
        svgAttr(aniSvg, { attributeName: "stdDeviation", values: "1;10;1", dur: "2s", repeatCount: "indefinite" })
        svgAppend(feGaussianBlur, aniSvg);
    }

    /** 小图标绘制 **/
    drawerIcon({ parentGfx, element, iconConfig, centered: iconCentered });

    /** multiInstanceLoopCharacteristics  standardLoopCharacteristics 绘制**/
    drawerLoopCharacteristicsIcon({ parentGfx, element, iconConfig, centered: iconCentered, width, height })

    return newSvg;
}


/**
 * 文字标注绘制
*/
export function renderTextAnnotation({ parentGfx, element, thisContext, styleConfig }) {
    const { borderColor, borderWidth, backgroundColor } = styleConfig;

    /** 元素路径 **/
    const pathData = getRectPath(assign({}, element, { x: 0, y: 0 }));
    /** 元素绘制、外框边框和背景绘制 **/
    const newSvg = svgCreate("path", {
        d: pathData,
        stroke: borderColor,
        strokeWidth: borderWidth,
        fill: backgroundColor,
        fillStyle: 'solid',
        strokeDasharray: "5,5"
    });
    svgAppend(parentGfx, newSvg);

    return newSvg;
}

/**
 * 文字标注的虚线
*/
export function renderAssociation({ parentGfx, element, arrowsConfig }) {
    const { backgroundColor, width } = arrowsConfig;
    const { waypoints: [start, end] } = element;
    const line = svgCreate("line", {
        x1: start.x, y1: start.y,
        x2: end.x, y2: end.y,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: width,
        strokeDasharray: "5,5",
        stroke: getStrokeColor(element, backgroundColor),
    });
    svgAppend(parentGfx, line);
    return line;
}

/**
 * 绘制圆
*/
export function drawCircle(arg) {
    return drawRect({ ...arg, drawType: "circle" })
}

/**
 * 所有文字的绘制
*/
export const renderLabel = (element, parentGfx, label, options, thisContext, styleConfig) => {
    const { fontSize = 12, textPosition } = styleConfig;
    options = assign({ size: { width: 100 } }, options);
    const text = thisContext.textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');
    svgAppend(parentGfx, text);

    if (isAny(element, ["bpmn:Task", "bpmn:StartEvent"])) {
        if (textPosition === "bottom") {
            svgAttr(svgSelect(text, "tspan"), {
                // y: is(element, "bpmn:StartEvent") ? options.box.height * 2 + 18 : options.box.height + 18
                y: is(element, "bpmn:StartEvent") ? 12 : options.box.height + 18,
                x: label?.length ? -(label.length / 2 * parseInt(fontSize) - element.width / 2) : 0
            })
        }
        if (textPosition === "top") {
            svgAttr(svgSelect(text, "tspan"), { y: -18 })
        }
    }

    return text;
}

/**
 * 内嵌式文字
*/
export const renderEmbeddedLabel = ({ parentGfx, element, align, thisContext, styleConfig, bounds }) => {
    const { color, fontSize = 12, fontFamily = "" } = styleConfig;
    const semantic = getSemantic(element);
    // 
    const box = { ...(bounds || element) };
    const boxOtherStyle = {};
    let _align = align;
    // 备注是存到了 text 中
    return renderLabel(element, parentGfx, semantic.name || semantic.text, {
        box: {
            ...box,
            ...boxOtherStyle,

            // 固定设置，避免 box k宽度太小了会导致文字折行
            width: 100,
        },
        // fitBox: true,
        align: _align,
        style: {
            textAlign: "center",
            fontSize, fontFamily,
            fill: getStrokeColor(element, color)
        }
    }, thisContext, styleConfig, bounds);
}


/**
 * 外面文字
*/
export const renderExternalLabel = ({ parentGfx, element, thisContext, styleConfig }) => {
    const { color, fontSize = 12, fontFamily = "" } = styleConfig;
    const box = {
        width: 100,
        height: 30,
        x: element.width / 2 + element.x,
        y: element.height / 2 + element.y
    };
    const target = element.labelTarget;
    let align = target?.y > element?.y ? 'center-bottom' : 'center-top';


    return renderLabel(element, parentGfx, getLabel(element), {
        box: box,
        align: align,
        fitBox: true,
        style: assign(
            {},
            thisContext.textRenderer.getExternalStyle(),
            {
                fontSize, fontFamily,
                fill: getStrokeColor(element, color)
            }
        )
    }, thisContext, styleConfig);
}

/**
 * 给元素绘制小图标
*/
export function drawerIcon({ parentGfx, element, iconConfig, centered }) {
    const { type, width, height } = element;

    const privateIconConfig = iconConfig[type];
    const { center, color: svgColor, width: svgWidth, height: svgHeight, left: svgLeft, top: svgTop, svgs = {} } = {
        ...iconConfig,
        ...privateIconConfig
    };
    const iconPath = svgs[type]?.({ element });
    if (!iconPath) return; // 没有就不渲染
    const iconSvg = svgCreate("g", { class: `${type}-icon` });
    svgAppend(parentGfx, iconSvg);
    innerSVG(iconSvg, iconPath);
    const iconPathEle = svgSelectAll(iconSvg, "svg");
    iconPathEle.forEach((ele) => {
        const attrs = {
            width: svgWidth, height: svgHeight, fill: svgColor, x: svgLeft, y: svgTop
        };
        if (centered || center) {
            attrs.x = width / 2 - parseInt(svgWidth) / 2;
            attrs.y = height / 2 - parseInt(svgHeight) / 2;
        }
        svgAttr(ele, attrs)
    })
}

/**
 * 给元素绘制事件图表
*/
export function drawerLoopCharacteristicsIcon({ parentGfx, element, iconConfig, width, height }) {
    const businessObject = getBusinessObject(element);
    const { type } = element;
    const privateIconConfig = iconConfig[type];
    const { center, color: svgColor } = {
        ...iconConfig,
        ...privateIconConfig
    };
    if (businessObject.loopCharacteristics) {
        const { loopCharacteristics } = businessObject;
        // 加个壳子方便设置样式, 图标居中时小图标放到左上角 
        const iconSvg = svgCreate("svg", center ? { x: width / 2 - 7, y: -(height - 19) } : {});
        let LoopcharacteristicsPath;
        const iconStyle = `fill: none;stroke-width:2;stroke:${svgColor};scale:${center ? "0.80" : "0"}`;
        if (loopCharacteristics.$type === "bpmn:MultiInstanceLoopCharacteristics") {
            if (!loopCharacteristics.isSequential) {
                // 横着画三条杠
                LoopcharacteristicsPath = svgCreate("path", {
                    d: "m24,40 m 3,2 l 0,10 m 3,-10 l 0,10 m 3,-10 l 0,10",
                    style: iconStyle
                });
                svgAppend(iconSvg, LoopcharacteristicsPath);
            } else {
                // 竖着画三条杠
                // console.log('businessObject', loopCharacteristics.$type, loopCharacteristics);
                LoopcharacteristicsPath = svgCreate("path", {
                    d: "m27,41 m 0,3 l 10,0 m -10,3 l 10,0 m -10,3 l 10,0",
                    style: iconStyle,
                });
                svgAppend(iconSvg, LoopcharacteristicsPath);
            }
        } else if (loopCharacteristics.$type === "bpmn:StandardLoopCharacteristics") {
            // 画一个循环符号
            LoopcharacteristicsPath = svgCreate("path", {
                d: "m 30,53 c 3.526979,0 6.386161,-2.829858 6.386161,-6.320661 0,-3.490806 -2.859182,-6.320661 -6.386161,-6.320661 -3.526978,0 -6.38616,2.829855 -6.38616,6.320661 0,1.745402 0.714797,3.325567 1.870463,4.469381 0.577834,0.571908 1.265885,1.034728 2.029916,1.35457 l -0.718163,-3.909793 m 0.718163,3.909793 -3.885211,0.802902",
                style: iconStyle
            });
            svgAppend(iconSvg, LoopcharacteristicsPath);
        }

        svgAppend(parentGfx, iconSvg);

    }

}


/**
 * 绘制箭头路径
*/
export function drawPath({ parentGfx, element, thisContext, arrowsConfig }) {
    const { waypoints, id } = element;
    const { backgroundColor, width, joinStyle = "C", arrowsWidth, arrowsHeight } = arrowsConfig;

    // 路线规划
    let d = '';
    waypoints.forEach(({ x, y }, i) => {
        if (i === 0) {
            // 超过两条的线段都需要可以设置转角样式
            d = `M${x},${y} ${waypoints.length > 2 ? joinStyle : ""}`;
        } else {
            d = `${d} ${x},${y}`
        }
    });

    // 创建一个箭头 marker 
    const markId = `bpmn-renderer-${id}_marker`
    const markerDef = svgCreate("defs");
    innerSVG(markerDef, `
        <marker id='${markId}' markerWidth='${arrowsWidth}' markerHeight='${arrowsHeight}' orient='auto'>
            <path d='M0,0 L0,${arrowsHeight} L${arrowsWidth},${arrowsHeight / 2} L0,0' style='fill:${backgroundColor}' />
        </marker>
    `);
    svgAppend(parentGfx, markerDef);
    const markerEle = svgSelect(markerDef, "marker");
    svgAttr(markerEle, {
        markerWidth: arrowsWidth,
        arrowsHeight: arrowsHeight,
        refX: (arrowsWidth),
        refY: arrowsHeight / 2,
    })

    // 路线绘制
    const pathSvg = svgCreate("path", {
        d,
        stroke: backgroundColor,
        strokeWidth: width,
        fill: 'none',
        markerEnd: `url(#${markId})`
    });
    svgAppend(parentGfx, pathSvg);

    return pathSvg;
}
