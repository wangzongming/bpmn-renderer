
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'; 
import defaultStyle from './defaultStyle'
import { merge } from 'min-dash';
import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * 自定义元素大小 
 */
function CustomElementFactoryFn({ style = {} }) {
    const diyStyle = merge({}, { ...defaultStyle }, { ...style })
    const { base: { width, height } } = diyStyle;

    class CustomElementFactory extends ElementFactory {
        constructor(bpmnFactory, moddle, translate, elementFactory) {
            super(bpmnFactory, moddle, translate);
            const backup_getDefaultSize = elementFactory.getDefaultSize;
            elementFactory.getDefaultSize = (element, di) => {
                if (is(element, 'bpmn:Task')) {
                    return { width: width, height: height };
                }
                return backup_getDefaultSize(element, di);
            }
        }
    }
    CustomElementFactory.$inject = [
        'bpmnFactory',
        'moddle',
        'translate',
        'elementFactory'
    ];
    return CustomElementFactory;
}

export default CustomElementFactoryFn
