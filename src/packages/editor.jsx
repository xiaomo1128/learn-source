import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from "./editor-block.jsx";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger.js";
import { useFocus } from "./useFocus.js";
import { useBlockDragger } from "./useBlockDragger";

export default defineComponent({
    props: {
        modelValue: {
            type: Object
        }
    },
    emits: ['update:modelValue'], // 触发事件
    setup(props, ctx) {
        const data = computed({
            get() {
                return props.modelValue
            },
            set( newV ) {
                ctx.emit('update:modelValue', deepcopy(newV))
            }
        })

        const containerStyle = computed( () => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config')

        const containerRef = ref(null)
        // 实现菜单拖拽功能
        const { dragstart, dragend } = useMenuDragger( containerRef, data)

        // 实现获取焦点        
        const { containerMousedown, focusData, blockMousedown } = useFocus(data, (e) => {
            mousedown(e)
        })
        // 选中后可能直接进行拖拽
        let { mousedown } = useBlockDragger(focusData)
        
        


        return ()=> (
            <div class="editor">
                <div class="editor-left">
                    {/* 根据注册列表 渲染对应内容 */}
                    { config.componentList.map( component => (
                        <div className="editor-left-item" draggable="true" onDragstart={e => dragstart(e, component)} onDragend={dragend}>
                            <span>{ component.label }</span>
                            <div>{ component.preview() }</div>
                        </div>
                    ))}
                </div>
                <div class="editor-top">菜单栏</div>
                <div class="editor-right">属性控制栏</div>
                <div class="editor-container">
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 内容区域 */}
                        <div ref={containerRef} class="editor-container-canvas__content" style={containerStyle.value} onMousedown={containerMousedown}>
                            {
                                data.value.blocks.map( block => (
                                    <EditorBlock class={block.focus ? 'editor-block-focus' : '' } block={block} onMousedown={(e) => blockMousedown(e, block)}></EditorBlock>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
