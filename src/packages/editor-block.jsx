import { computed, defineComponent, inject, onMounted, ref } from "vue";
import BlockResize from "./block-resize";


export default defineComponent({
    props: {
        block: { 
            type: Object
        },
        formData: {
            type: Object
        }
    },
    setup(props) {
        const config = inject('config')
        const blockStyles = computed(()=> ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}`
        }))

        const blockRef = ref(null)
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value
            if (props.block.alignCenter) {
                // 当拖拽松开后 才渲染，其他默认渲染在页面上的内容不需要居中
                props.block.left = props.block.left - offsetWidth/2
                props.block.top = props.block.top - offsetHeight/2 
                // 模块渲染后 才去实现居中效果
                props.block.alignCenter = false
            }
            props.block.width = offsetWidth
            props.block.height = offsetHeight
        })

        return () => {
            // 通过 block 的key 属性直接获取对应组件
            const component = config.componentMap[props.block.key];
            // 获取 render函数
            const RenderComponent = component.render({
                size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
                props: props.block.props,
                // model: props.block.model 
                model: Object.keys( component.model || {}).reduce(( prev, modelName ) => {
                    let propName = props.block.model[modelName]; // 获取到 'username'
                    prev[modelName] = {
                        modelValue: props.formData[propName],
                        'onUpdate:modelValue': v => props.formData[propName] = v
                    };
                    return prev;
                }, {})
            });
            const { width, height } = component.resize || {}; 

            return (<div class="editor-block" style={blockStyles.value} ref={blockRef}>
                { RenderComponent }

                {/* 传递block的目的 为了修改当前block的宽高，component中 存放修改高度or宽度 */}
                { props.block.focus && (width || height) && (<BlockResize block={props.block} component={component}></BlockResize>)}
            </div>)
        }
    }
}) 
