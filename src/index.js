 

import Provider from "./Provider"
import ProviderByElementFactory from "./ProviderByElementFactory"
export default (...arg) => ({
    __init__: ['customElementFactory', 'customRenderer'],  
    customRenderer: [
        'type', 
        Provider(...arg)
    ],
    customElementFactory: [
        'type', 
        ProviderByElementFactory(...arg)
    ],
})