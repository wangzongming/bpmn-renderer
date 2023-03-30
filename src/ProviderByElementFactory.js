
import BaseElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
// import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
// import { getDi } from 'bpmn-js/lib/draw/BpmnRenderUtil';

import defaultStyle from './defaultStyle'

/**
 * 测试中
* 对节点大小获取的函数直接修改
* 写到下面无效，必须用 prototype 方式设置
*/
BaseElementFactory.prototype.getDefaultSize = function (element, di) {
    console.log('走这里', element, di)
    return { width: 70, height: 70 };

    // var bo = getBusinessObject(element);
    // di = di || getDi(element);

    // if (is(bo, 'bpmn:SubProcess')) {
    //     if (isExpanded(bo, di)) {
    //         return { width: 350, height: 200 };
    //     } else {
    //         return { width: 100, height: 80 };
    //     }
    // }

    // if (is(bo, 'bpmn:Task')) {
    //     return { width: 100, height: 80 };
    // }

    // if (is(bo, 'bpmn:Gateway')) {
    //     return { width: 50, height: 50 };
    // }

    // if (is(bo, 'bpmn:Event')) {
    //     return { width: 36, height: 36 };
    // }

    // if (is(bo, 'bpmn:Participant')) {
    //     if (isExpanded(bo, di)) {
    //         return { width: 600, height: 250 };
    //     } else {
    //         return { width: 400, height: 60 };
    //     }
    // }

    // if (is(bo, 'bpmn:Lane')) {
    //     return { width: 400, height: 100 };
    // }

    // if (is(bo, 'bpmn:DataObjectReference')) {
    //     return { width: 36, height: 50 };
    // }

    // if (is(bo, 'bpmn:DataStoreReference')) {
    //     return { width: 50, height: 50 };
    // }

    // if (is(bo, 'bpmn:TextAnnotation')) {
    //     return { width: 100, height: 30 };
    // }

    // if (is(bo, 'bpmn:Group')) {
    //     return { width: 300, height: 300 };
    // }

    // return { width: 100, height: 80 };
}

/**
 * 自定义元素大小 
 */
function CustomElementFactoryFn({ nodesInfo = {} }) {
    class CustomElementFactory extends BaseElementFactory {
        constructor(moddle, translate) {
            super();

            this.moddle = moddle;
            this.translate = translate;
            /**
             * 元素样式
             */
            this.diyStyle = { ...defaultStyle }
            // console.log(this)
        }
        getDefaultSize(element, di) {
            console.log('element', element);
            return { width: 50, height: 50 };

            // var bo = getBusinessObject(element);
            // di = di || getDi(element);

            // if (is(bo, 'bpmn:SubProcess')) {
            //     if (isExpanded(bo, di)) {
            //         return { width: 350, height: 200 };
            //     } else {
            //         return { width: 100, height: 80 };
            //     }
            // }

            // if (is(bo, 'bpmn:Task')) {
            //     return { width: 100, height: 80 };
            // }

            // if (is(bo, 'bpmn:Gateway')) {
            //     return { width: 50, height: 50 };
            // }

            // if (is(bo, 'bpmn:Event')) {
            //     return { width: 36, height: 36 };
            // }

            // if (is(bo, 'bpmn:Participant')) {
            //     if (isExpanded(bo, di)) {
            //         return { width: 600, height: 250 };
            //     } else {
            //         return { width: 400, height: 60 };
            //     }
            // }

            // if (is(bo, 'bpmn:Lane')) {
            //     return { width: 400, height: 100 };
            // }

            // if (is(bo, 'bpmn:DataObjectReference')) {
            //     return { width: 36, height: 50 };
            // }

            // if (is(bo, 'bpmn:DataStoreReference')) {
            //     return { width: 50, height: 50 };
            // }

            // if (is(bo, 'bpmn:TextAnnotation')) {
            //     return { width: 100, height: 30 };
            // }

            // if (is(bo, 'bpmn:Group')) {
            //     return { width: 300, height: 300 };
            // }

            // return { width: 100, height: 80 };
        };
    }

    CustomElementFactory.$inject = ['moddle', 'translate'];
    return CustomElementFactory;
}

export default CustomElementFactoryFn
