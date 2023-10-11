import { computed, defineComponent, inject, onMounted, ref } from "vue";


export default defineComponent({
    props: {
        block: { 
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
        })

        return () => {
            return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                { (config.componentMap[props.block.key]).render() }
            </div>
        }
    }
}) 
