
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
// import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
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
        default: // 默认绘制正方形
            pathData = getRoundRectPath(assign({}, element, { x: startX, y: startY, width, height }), borderRadius);
            break;
    }
    // const bo = getBusinessObject(element); 
    // if (is(bo, 'bpmn:UserTask')) {
    //     console.log("parentGfx", parentGfx.parentElement) 
    // }

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
    const feColorMatrix = svgCreate('feColorMatrix', { result: "matrixOut", in: "offOut", type: 'matrix', values: "0.08 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" });
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
        svgAttr(aniSvg, { attributeName: "stdDeviation", values: "1;6;1", dur: "2s", repeatCount: "indefinite" })
        svgAppend(feGaussianBlur, aniSvg);
    }

    /** 小图标绘制 **/
    drawerIcon({ parentGfx, element, iconConfig, centered: iconCentered })
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

export const renderLabel = (parentGfx, label, options, thisContext, styleConfig) => {
    options = assign({
        size: { width: 100 },
    }, options);
    const text = thisContext.textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');
    svgAppend(parentGfx, text);

    return text;
}

/**
 * 内嵌式文字
*/
export const renderEmbeddedLabel = ({ parentGfx, element, align, thisContext, styleConfig, bounds }) => {
    const { color, fontSize = 12, fontFamily = "" } = styleConfig;
    const semantic = getSemantic(element);
    // 备注是存到了 text 中
    return renderLabel(parentGfx, semantic.name || semantic.text, {
        box: bounds || element,
        align,
        padding: 5,
        style: {
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
        width: 90,
        height: 30,
        x: element.width / 2 + element.x,
        y: element.height / 2 + element.y
    };
    const target = element.labelTarget;
    const align = target?.y > element?.y ? 'center-bottom' : 'center-top';

    return renderLabel(parentGfx, getLabel(element), {
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
    const { color: svgColor, width: svgWidth, height: svgHeight, left: svgLeft, top: svgTop, svgs = {} } = {
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
        if (centered) {
            attrs.x = width / 2 - parseInt(svgWidth) / 2;
            attrs.y = height / 2 - parseInt(svgHeight) / 2;
        }
        svgAttr(ele, attrs)
    })
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
        <marker id='${markId}' markerWidth='${arrowsWidth}' markerHeight='${arrowsHeight}px' orient='auto'>
            <path d='M2,2 L2,11 L10,6 L2,2' style='fill:${backgroundColor}' />
        </marker>
    `);
    svgAppend(parentGfx, markerDef);
    const markerEle = svgSelect(markerDef, "marker");
    svgAttr(markerEle, {
        refX: (arrowsWidth - 2),
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
