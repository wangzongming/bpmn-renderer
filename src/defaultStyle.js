
import userIcon from "./icon/user"
import userGroup from "./icon/user_group"
import guidang from "./icon/guidang"
import chuanyue from "./icon/chuanyue"
import scriptIcon from "./icon/jiaobenrenwu"
import fuwuliu from "./icon/fuwuliu"
import message from "./icon/message"
import message_fill from "./icon/message_fill"
import hander from "./icon/hander"
import rule from "./icon/rule"
// import wubianxing from "./icon/wubianxing"

export default {
    base: {
        width: 100,
        height: 80,
    },
    // 默认样式
    will: {
        name: "未办理",
        // 节点
        node: {
            backgroundColor: "#fff",
            borderColor: "#dae2ec",
            borderRadius: 10,
            borderWidth: 2,
            // 节点文字颜色
            color: "#262c33",
            // color: "red",
            fontSize: 12,
            fontFamily: "苹方,微软雅黑",
            // 文字位置  top | bottom | center
            textPosition: "center",
            // 阴影大小
            boxShadowSize: 0,

            // 开始节点特殊样式
            'bpmn:StartEvent': {
                backgroundColor: "rgb(225, 250, 245)",
                borderColor: "rgb(67, 220, 188)",
            },
            // 结束节点特殊样式
            'bpmn:EndEvent': {
                backgroundColor: "rgb(255, 217, 217)",
                borderColor: "rgb(255, 79, 79)",
            },
            // 网关
            'bpmn:ExclusiveGateway': {
                borderColor: "#FFD400",
            },
            // 边界事件
            'bpmn:IntermediateThrowEvent': {
                borderColor: "#FFD400",
            }
        },
        // 节点连接线/箭头
        arrows: {
            // 线条粗细
            width: 1,
            backgroundColor: "#bfcbd9",
            // 转角连接类型  "L" 直线 | "C" 曲线,
            joinStyle: "C",
            // 箭头宽高， 必须为数字（单位 px） 
            arrowsWidth: 6,
            arrowsHeight: 6,
        },
        // 图标颜色
        icon: {
            width: 20,
            height: 20,
            color: "#a7b7cb",
            left: 5, top: 5,
            // 图标居中
            center: false,
            // // 网关
            // 'bpmn:ExclusiveGateway': {
            //     color: "#FFD400",
            //     width: 25,
            //     height: 25,
            // },
            /**
             * 各个元素的svg图标
             * 必须返回 一个 '<svg>...</svg>' 字符串
            */
            svgs: {
                // 用户任务
                'bpmn:UserTask': ({ element }) => {
                    // 串行、并行、循环时用用户组图标
                    if (element.businessObject.loopCharacteristics) {
                        return userGroup;
                    }
                    const nodeType = element.businessObject["userTaskType"];
                    return {
                        "1": chuanyue,
                        "2": guidang
                    }[nodeType] || userIcon;
                },
                'bpmn:ScriptTask': ({ element }) => scriptIcon,
                'bpmn:ServiceTask': ({ element }) => fuwuliu,
                'bpmn:SendTask': ({ element }) => message_fill,
                'bpmn:ReceiveTask': ({ element }) => message,
                'bpmn:ManualTask': ({ element }) => hander,
                'bpmn:BusinessRuleTask':  ({ element }) => rule,
                
            }
        },
    },

    // 被激活后的样式
    over: {
        name: "已办理",

        // 节点
        node: {
            backgroundColor: "rgb(225, 250, 245)",
            borderColor: "rgb(67, 220, 188)",
            borderRadius: 10,
            borderWidth: 2,
            // 节点文字颜色
            color: "rgb(67, 220, 188)",
            fontSize: 12,
            fontFamily: "苹方,微软雅黑",
            // 阴影大小
            boxShadowSize: 0,

            // 开始节点特殊样式
            'bpmn:StartEvent': {
                backgroundColor: "rgb(225, 250, 245)",
                borderColor: "rgb(67, 220, 188)",
            },
        },
        // 节点连接线/箭头
        arrows: {
            // 线条粗细
            width: 1,
            backgroundColor: "rgb(67, 220, 188)",
            // 转角连接类型  "L" 直线 | "C" 曲线,
            joinStyle: "C",
            // 箭头宽高， 必须为数字（单位 px）
            arrowsWidth: 12,
            arrowsHeight: 12,
        },
        // 图标颜色
        icon: {
            width: 20,
            height: 20,
            color: "rgb(67, 220, 188)",
            left: 5, top: 5,
            /**
             * 各个元素的svg图标
             * 必须返回 一个 '<svg>...</svg>' 字符串
            */
            svgs: {
                // 用户任务
                'bpmn:UserTask': ({ element }) => {
                    const nodeType = element.businessObject["userTaskType"];
                    return {
                        "1": chuanyue,
                        "2": guidang
                    }[nodeType] || userIcon;
                },
                'bpmn:ScriptTask': ({ element }) => scriptIcon,
                'bpmn:ServiceTask': ({ element }) => fuwuliu,
                // 网关内部小图标
                // 'bpmn:ExclusiveGateway': ({ element }) => wubianxing,
            }
        },
    },

    // 闪烁样式
    ing: {
        name: "正在办理",

        // 节点
        node: {
            backgroundColor: "rgb(225, 250, 245)",
            borderColor: "rgb(67, 220, 188)",
            borderRadius: 10,
            borderWidth: 2,
            // 节点文字颜色
            color: "rgb(67, 220, 188)",
            fontSize: 12,
            fontFamily: "苹方,微软雅黑",
            // 阴影大小
            boxShadowSize: 0,
        },
        // 节点连接线/箭头
        arrows: {
            // 线条粗细
            width: 1,
            backgroundColor: "rgb(67, 220, 188)",
            // 转角连接类型  "L" 直线 | "C" 曲线,
            joinStyle: "C",
            // 箭头宽高， 必须为数字（单位 px）
            arrowsWidth: 12,
            arrowsHeight: 12,
        },
        // 图标颜色
        icon: {
            width: 20,
            height: 20,
            color: "rgb(67, 220, 188)",
            left: 5, top: 5,
            /**
             * 各个元素的svg图标
             * 必须返回 一个 '<svg>...</svg>' 字符串
            */
            svgs: {
                // 用户任务
                'bpmn:UserTask': ({ element }) => {
                    const nodeType = element.businessObject["userTaskType"];
                    return {
                        "1": chuanyue,
                        "2": guidang
                    }[nodeType] || userIcon;
                },
                'bpmn:ScriptTask': ({ element }) => scriptIcon,
                'bpmn:ServiceTask': ({ element }) => fuwuliu,
                // 网关内部小图标
                // 'bpmn:ExclusiveGateway': ({ element }) => wubianxing,
            }
        },
    }
}
