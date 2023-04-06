
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import defaultStyle from './defaultStyle'
import { merge } from 'min-dash';

/**
 * 自定义元素大小 
 */
function CustomElementFactoryFn({ style = {} }) {
    const diyStyle = merge({}, { ...defaultStyle }, { ...style })
    class CustomElementFactory extends RuleProvider {
        constructor(eventBus, moddle) {
            super(eventBus, moddle);
        }
        init() {
            const { base: { width, height } } = diyStyle; 
            /**
             * 这里只能处理从左侧面板中拖过来的节点，
             * 右键菜单中的节点宽高更改需要到 ContextPad 插件中完成
            */
            this.addRule("shape.create", 1500, function (data) {
                if (data.shape.businessObject && data.shape.businessObject.$instanceOf('bpmn:Task')) {
                    data.shape.width = width;
                    data.shape.height = height;
                    return true;
                }
            }); 
        };
    }

    CustomElementFactory.$inject = ['eventBus', 'moddle'];
    return CustomElementFactory;
}

export default CustomElementFactoryFn
