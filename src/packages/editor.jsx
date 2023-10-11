import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from "./editor-block.jsx";

export default defineComponent({
    props: {
        modelValue: {
            type: Object
        }
    },
    setup(props) {
        const data = computed({
            get() {
                return props.modelValue
            }
        })

        const containerStyle = computed( () => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config')

        const containerRef = ref(null)
        const dragstart = (e, component) => {
            console.log('start', containerRef.value, e);
        }

        return ()=> (
            <div class="editor">
                <div class="editor-left">
                    {/* 根据注册列表 渲染对应内容 */}
                    { config.componentList.map( component => (
                        <div className="editor-left-item" draggable="true" onDragstart={e => dragstart(e, component)}>
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
                        <div ref={containerRef} class="editor-container-canvas__content" style={containerStyle.value} >
                            {
                                data.value.blocks.map( block => (
                                    <EditorBlock block={block}></EditorBlock>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
