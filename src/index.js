import ReplaceModule from 'bpmn-js/lib/features/replace';

import Provider from "./Provider"
// import ProviderByElementFactory from "./ProviderByElementFactory"
import EleFactory from "./EleFactory"
export default (...arg) => ({
    __init__: [
        "eleFactory",
        // 'customElementFactory', 
        'customRenderer'
    ],
    __depends__: [
        ReplaceModule,
    ],
    customRenderer: [
        'type',
        Provider(...arg)
    ],
    // customElementFactory: [
    //     'type',
    //     ProviderByElementFactory(...arg)
    // ],
    eleFactory: [
        'type',
        EleFactory(...arg)
    ]
})