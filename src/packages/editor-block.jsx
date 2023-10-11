import { computed, defineComponent, inject } from "vue";


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
        return () => {
            return <div class="editor-block" style={blockStyles.value}>
                { (config.componentMap[props.block.key]).render() }
            </div>
        }
    }
}) 
